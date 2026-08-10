import { updateCpuActiveLabel } from '../common/threadLabels';
import CpuUsage from './cpuusage/CpuUsage';
import { tryGetEpochFromFileName } from './TimestampParser';
import Thread from '../types/Thread';
import ThreadDump from '../types/ThreadDump';
import TopCpuUsageParser, { CPU_USAGE_TIMESTAMP_PATTERN } from './cpuusage/os/TopCpuUsageParser';
import { matchOne } from './RegExpUtils';
import AsyncThreadDumpParser, { THREAD_DUMP_DATE_PATTERN } from './AsyncThreadDumpParser';
import CpuUsageJfrParser, { CPU_USAGE_JFR_FIRST_LINE_PATTERN } from './cpuusage/jfr/CpuUsageJfrParser';
import { getPerformanceConfig, PerformanceConfig } from './PerformanceConfig';

// Maximum time difference (in ms) to consider CPU usage and thread dump as corresponding
// This allows matching files even if the timestamps are not exactly the same, as usually they
// are taken by alternating top and jstack commands
const MAX_DIFFERENCE_BETWEEN_CORRESPONDING_FILES_IN_MS = 10000;
const AN_HOUR = 60 * 60 * 1000;
// Limits React progress state updates while parsing to avoid rendering overhead
const PROGRESS_UPDATE_INTERVAL_MS = 200;
// Gives the browser a paint opportunity roughly once per 60 Hz frame
const UI_YIELD_INTERVAL_MS = 16;

export interface ParseProgress {
  phase: 'reading' | 'parsing' | 'grouping' | 'complete';
  fileName: string;
  filesProcessed: number;
  totalFiles: number;
  linesProcessed: number;
  totalLines: number;
  percentage: number;
}

export type ProgressCallback = (progress: ParseProgress) => void | Promise<void>;
export type CompletionCallback = (threadDumps: ThreadDump[]) => void | Promise<void>;

export default class AsyncParser {
  private cpuUsages: CpuUsage[] = [];

  private threadDumps: ThreadDump[] = [];

  private filesToParse = 0;

  private filesProcessed = 0;

  private totalBytes = 0;

  private processedBytes = 0;

  private currentFileSize = 0;

  private currentFileName = '';

  private isProcessing = false;

  private lastProgressUpdateAt = 0;

  private lastProgressPhase: ParseProgress['phase'] | undefined;

  private lastUiYieldAt = 0;

  private readonly onFilesParsed: CompletionCallback;

  private readonly onProgress?: ProgressCallback;

  private readonly config: PerformanceConfig;

  constructor(onFilesParsed: CompletionCallback, onProgress?: ProgressCallback) {
    this.onFilesParsed = onFilesParsed;
    this.config = getPerformanceConfig();
    if (onProgress !== undefined) {
      this.onProgress = onProgress;
    }
  }

  public async parseFiles(uploaded: File[]): Promise<void> {
    AsyncParser.markPerformance('start');
    if (this.isProcessing) {
      throw new Error('Parser is already processing files');
    }

    this.isProcessing = true;
    this.cpuUsages = [];
    this.threadDumps = [];
    this.filesToParse = uploaded.length;
    this.filesProcessed = 0;
    this.totalBytes = uploaded.reduce((total, file) => total + file.size, 0);
    this.processedBytes = 0;
    this.currentFileSize = 0;
    this.lastProgressUpdateAt = 0;
    this.lastProgressPhase = undefined;
    this.lastUiYieldAt = 0;

    try {
      await this.parseFilesAsync(uploaded);
    } finally {
      this.isProcessing = false;
    }
  }

  private async parseFilesAsync(files: File[]): Promise<void> {
    const parserStartedAt = performance.now();

    // Process files sequentially to avoid memory overload
    for (const file of files) {
      this.currentFileName = file.name;
      this.currentFileSize = file.size;
      // eslint-disable-next-line no-await-in-loop
      await this.parseFile(file);
      this.filesProcessed++;
      this.processedBytes += file.size;

      // eslint-disable-next-line no-await-in-loop
      await this.reportProgressAndRefreshUi('parsing', 0, 0, true);
    }

    await this.reportProgressAndRefreshUi('grouping', 0, 0);
    const groupingStartedAt = performance.now();
    await this.groupCpuUsagesWithThreadDumpsAsync();
    AsyncParser.measurePerformance('grouping', groupingStartedAt);

    const sortingStartedAt = performance.now();
    this.sortThreadDumps();
    AsyncParser.measurePerformance('sorting', sortingStartedAt);
    AsyncParser.measurePerformance('parser-total', parserStartedAt);

    await this.reportProgressAndRefreshUi('complete', 0, 0);
    await this.onFilesParsed(this.threadDumps);
  }

  private async parseFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const readStartedAt = performance.now();
      const reader = new FileReader();

      reader.onload = async () => {
        AsyncParser.measurePerformance('file-read', readStartedAt);
        const parsingStartedAt = performance.now();
        try {
          await this.reportProgressAndRefreshUi('reading', 0, 0);

          const content = reader.result as string;
          const lines: string[] = content.split('\n');
          const firstLine = lines[0];

          if (!firstLine) {
            AsyncParser.measurePerformance('file-parse', parsingStartedAt);
            resolve();
            return;
          }

          if (matchOne(CPU_USAGE_TIMESTAMP_PATTERN, firstLine)) {
            this.parseTopCpuUsage(lines);
          } else if (matchOne(CPU_USAGE_JFR_FIRST_LINE_PATTERN, firstLine)) {
            this.parseJfrCpuUsage(file.name, lines);
          } else {
            await this.splitThreadDumpsAsync(lines, tryGetEpochFromFileName(file.name));
          }

          AsyncParser.measurePerformance('file-parse', parsingStartedAt);
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
      reader.readAsText(file);
    });
  }

  private async splitThreadDumpsAsync(lines: string[], epochFromFileName?: number): Promise<void> {
    let threadDumpCount = 0;
    for (const line of lines) {
      if (matchOne(THREAD_DUMP_DATE_PATTERN, line)) {
        threadDumpCount++;
      }
    }

    // One filename timestamp cannot identify multiple dumps in the same file
    const epochFromFileNameForSingleDump = threadDumpCount === 1 ? epochFromFileName : undefined;
    let currentDumpStartIndex: number | undefined;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      if (matchOne(THREAD_DUMP_DATE_PATTERN, lines[lineIndex])) {
        if (currentDumpStartIndex !== undefined) {
          // eslint-disable-next-line no-await-in-loop
          await this.parseThreadDumpAsync(lines, currentDumpStartIndex, lineIndex, epochFromFileNameForSingleDump);
        }
        currentDumpStartIndex = lineIndex;
      }
    }

    if (currentDumpStartIndex !== undefined) {
      await this.parseThreadDumpAsync(lines, currentDumpStartIndex, lines.length, epochFromFileNameForSingleDump);
    }
  }

  private parseTopCpuUsage(lines: string[]): void {
    // For now, keep CPU usage parsing synchronous as it's typically smaller
    TopCpuUsageParser.parseCpuUsage(lines.slice(), this.onParsedCpuUsage);
  }

  private parseJfrCpuUsage(fileName: string, lines: string[]): void {
    // For now, keep JFR parsing synchronous as it's typically smaller
    CpuUsageJfrParser.parseCpuUsage(fileName, lines.slice(), this.onParsedCpuUsage);
  }

  private onParsedCpuUsage = (cpuUsage: CpuUsage) => {
    this.cpuUsages.push(cpuUsage);
  };

  private async parseThreadDumpAsync(
    lines: readonly string[],
    startIndex: number,
    endIndex: number,
    epochFromFileName?: number,
  ): Promise<void> {
    await AsyncThreadDumpParser.parseThreadDump(
      lines,
      this.onParsedThreadDump,
      async (processed) => {
        // Update progress for line processing within this thread dump
        await this.reportProgressAndRefreshUi('parsing', startIndex + processed + 1, lines.length);
      },
      this.config,
      epochFromFileName,
      startIndex,
      endIndex,
    );
  }

  private onParsedThreadDump = (threadDump: ThreadDump) => {
    if (threadDump.threads.length > 0) {
      this.threadDumps.push(threadDump);
    }
  };

  private async groupCpuUsagesWithThreadDumpsAsync(): Promise<void> {
    let lastYieldAt = performance.now();

    for (const cpuUsage of this.cpuUsages) {
      if (cpuUsage.epoch) {
        const threadDump: ThreadDump = this.findCorrespondingThreadDump(cpuUsage);
        AsyncParser.groupCpuUsageWithThreadDump(threadDump, cpuUsage);

        if (performance.now() - lastYieldAt >= UI_YIELD_INTERVAL_MS) {
          // eslint-disable-next-line no-await-in-loop
          await AsyncParser.delay(this.config.threadDumpProcessingDelay);
          lastYieldAt = performance.now();
        }
      }
    }
  }

  private sortThreadDumps(): void {
    this.threadDumps.sort((t1, t2) => {
      if (t1.epoch === t2.epoch) {
        return 0;
      }
      if (!t1.epoch) {
        return -1;
      }
      if (!t2.epoch) {
        return 1;
      }
      return t1.epoch - t2.epoch;
    });
  }

  private findCorrespondingThreadDump(cpuUsage: CpuUsage): ThreadDump {
    const cpuUsageEpoch = cpuUsage.epoch;
    const exactMatch = cpuUsage.timestampKind === 'absolute'
      ? this.findClosestThreadDump((dumpEpoch) => Math.abs(dumpEpoch - cpuUsageEpoch))
      : undefined;

    // Prefer full filename timestamps, but retain the legacy fallback for captures with different clock hours.
    const closest = exactMatch ?? this.findClosestThreadDump(
      (dumpEpoch) => Math.abs((dumpEpoch % AN_HOUR) - (cpuUsageEpoch % AN_HOUR)),
    );

    if (closest == null) {
      const threadDump = new ThreadDump(cpuUsageEpoch);
      this.threadDumps.push(threadDump);
      return threadDump;
    }

    return closest;
  }

  private findClosestThreadDump(
    getDifference: (dumpEpoch: number) => number,
  ): ThreadDump | undefined {
    let closest: ThreadDump | undefined;
    let smallestDiff = MAX_DIFFERENCE_BETWEEN_CORRESPONDING_FILES_IN_MS;

    this.threadDumps
      .filter((threadDump) => threadDump.epoch)
      .forEach((threadDump) => {
        const diff = getDifference(threadDump.epoch);
        if (diff < smallestDiff) {
          smallestDiff = diff;
          closest = threadDump;
        }
      });

    return closest;
  }

  private static groupCpuUsageWithThreadDump(threadDump: ThreadDump, cpuUsage: CpuUsage): void {
    if (cpuUsage.loadAverages !== undefined) {
      // eslint-disable-next-line no-param-reassign
      threadDump.loadAverages = cpuUsage.loadAverages;
    }
    // eslint-disable-next-line no-param-reassign
    threadDump.runningProcesses = cpuUsage.runningProcesses;
    if (cpuUsage.memoryUsage !== undefined) {
      // eslint-disable-next-line no-param-reassign
      threadDump.memoryUsage = cpuUsage.memoryUsage;
    }

    const threadsById = new Map<number, Thread>();
    for (const thread of threadDump.threads) {
      if (!threadsById.has(thread.id)) {
        threadsById.set(thread.id, thread);
      }
    }

    cpuUsage.getThreadCpuUsages().forEach((cpu) => {
      const thread = threadsById.get(cpu.id);

      if (thread) {
        thread.cpuUsage = cpu.getCpuUsage();
        thread.runningFor = cpu.runningFor;
        updateCpuActiveLabel(thread);
      }
    });
  }

  private async reportProgressAndRefreshUi(
    phase: ParseProgress['phase'],
    linesProcessed: number,
    totalLines: number,
    forceProgressUpdate = false,
  ): Promise<void> {
    if (!this.onProgress) return;

    const now = performance.now();
    const shouldReportProgress = forceProgressUpdate
      || phase !== this.lastProgressPhase
      || now - this.lastProgressUpdateAt >= PROGRESS_UPDATE_INTERVAL_MS;

    if (shouldReportProgress) {
      if (phase !== this.lastProgressPhase) {
        AsyncParser.markPerformance(phase);
      }

      const currentFileFraction = totalLines === 0 ? 0 : linesProcessed / totalLines;
      const processedFraction = this.totalBytes === 0
        ? this.filesProcessed / this.filesToParse
        : (this.processedBytes + (this.currentFileSize * currentFileFraction)) / this.totalBytes;

      let percentage: number;
      if (phase === 'complete') {
        percentage = 100;
      } else if (phase === 'grouping') {
        percentage = 95; // Almost done
      } else {
        percentage = processedFraction * 95;
      }

      const progressUpdate = this.onProgress({
        phase,
        fileName: this.currentFileName,
        filesProcessed: this.filesProcessed,
        totalFiles: this.filesToParse,
        linesProcessed,
        totalLines,
        percentage: Math.min(100, Math.max(0, percentage)),
      });
      if (phase === 'grouping') {
        await progressUpdate;
      }
      this.lastProgressUpdateAt = now;
      this.lastProgressPhase = phase;
    }

    if (phase !== 'parsing' || now - this.lastUiYieldAt >= UI_YIELD_INTERVAL_MS) {
      this.lastUiYieldAt = now;
      await AsyncParser.delay(this.config.threadDumpProcessingDelay);
    }
  }

  private static markPerformance(phase: string): void {
    if (typeof performance.mark === 'function') {
      performance.mark(`watson:parser:${phase}`);
    }
  }

  private static measurePerformance(name: string, startTime: number): void {
    if (typeof performance.measure === 'function') {
      performance.measure(`watson:${name}`, {
        start: startTime,
        duration: performance.now() - startTime,
      });
    }
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
