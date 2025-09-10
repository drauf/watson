import CpuUsage from './cpuusage/CpuUsage';
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

export interface ParseProgress {
  phase: 'reading' | 'parsing' | 'grouping' | 'complete';
  fileName: string;
  filesProcessed: number;
  totalFiles: number;
  linesProcessed: number;
  totalLines: number;
  percentage: number;
}

export type ProgressCallback = (progress: ParseProgress) => void;
export type CompletionCallback = (threadDumps: ThreadDump[]) => void;

export default class AsyncParser {
  private cpuUsages: CpuUsage[] = [];

  private threadDumps: ThreadDump[] = [];

  private filesToParse = 0;

  private filesProcessed = 0;

  private currentFileName = '';

  private isProcessing = false;

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
    if (this.isProcessing) {
      throw new Error('Parser is already processing files');
    }

    this.isProcessing = true;
    this.cpuUsages = [];
    this.threadDumps = [];
    this.filesToParse = uploaded.length;
    this.filesProcessed = 0;

    try {
      await this.parseFilesAsync(uploaded);
    } finally {
      this.isProcessing = false;
    }
  }

  private async parseFilesAsync(files: File[]): Promise<void> {
    // Process files sequentially to avoid memory overload
    // eslint-disable-next-line no-await-in-loop
    for (const file of files) {
      this.currentFileName = file.name;
      // eslint-disable-next-line no-await-in-loop
      await this.parseFile(file);
      this.filesProcessed++;

      this.reportProgress('parsing', 0, 0);
    }

    this.reportProgress('grouping', 0, 0);
    this.groupCpuUsagesWithThreadDumpsAsync();
    this.sortThreadDumps();

    this.reportProgress('complete', 0, 0);
    this.onFilesParsed(this.threadDumps);
  }

  private async parseFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async () => {
        try {
          this.reportProgress('reading', 0, 0);

          const content = reader.result as string;
          const lines: string[] = content.split('\n');
          const firstLine = lines[0];

          if (!firstLine) {
            resolve();
            return;
          }

          if (matchOne(CPU_USAGE_TIMESTAMP_PATTERN, firstLine)) {
            this.parseTopCpuUsage(lines);
          } else if (matchOne(CPU_USAGE_JFR_FIRST_LINE_PATTERN, firstLine)) {
            this.parseJfrCpuUsage(file.name, lines);
          } else {
            await this.splitThreadDumpsAsync(lines);
          }

          resolve();
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
      reader.readAsText(file);
    });
  }

  private async splitThreadDumpsAsync(lines: string[]): Promise<void> {
    let currentDump: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if a new thread dump starts
      if (matchOne(THREAD_DUMP_DATE_PATTERN, line)) {
        // Special case for the first thread dump in the file
        if (currentDump.length === 0) {
          currentDump.push(line);
        } else {
          // eslint-disable-next-line no-await-in-loop
          await this.parseThreadDumpAsync(currentDump);
          currentDump = [line];
        }
      } else if (currentDump.length > 0) {
        // Do not add lines if there is no thread dump (e.g. when parsing catalina.out)
        currentDump.push(line);
      }
    }

    if (currentDump.length > 0) {
      await this.parseThreadDumpAsync(currentDump);
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

  private async parseThreadDumpAsync(lines: string[]): Promise<void> {
    await AsyncThreadDumpParser.parseThreadDump(
      lines.slice(),
      this.onParsedThreadDump,
      (processed, total) => {
        // Update progress for line processing within this thread dump
        this.reportProgress('parsing', processed, total);
      },
      this.config,
    );
  }

  private onParsedThreadDump = (threadDump: ThreadDump) => {
    if (threadDump.threads.length > 0) {
      this.threadDumps.push(threadDump);
    }
  };

  private groupCpuUsagesWithThreadDumpsAsync(): void {
    const cpuUsagesWithEpoch = this.cpuUsages.filter((cpuUsage) => cpuUsage.epoch);

    for (let i = 0; i < cpuUsagesWithEpoch.length; i++) {
      const cpuUsage = cpuUsagesWithEpoch[i];
      const threadDump: ThreadDump = this.findCorrespondingThreadDump(cpuUsage);
      AsyncParser.groupCpuUsageWithThreadDump(threadDump, cpuUsage);
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
    const AN_HOUR = 60 * 60 * 1000;
    const cpuUsageEpoch = cpuUsage.epoch;
    let closest: ThreadDump | null = null;
    let smallestDiff: number = MAX_DIFFERENCE_BETWEEN_CORRESPONDING_FILES_IN_MS;

    this.threadDumps
      .filter((threadDump) => threadDump.epoch)
      .forEach((threadDump) => {
        const dumpEpoch = threadDump.epoch;

        if (!dumpEpoch || !cpuUsageEpoch) {
          return;
        }

        const diff = Math.abs((dumpEpoch % AN_HOUR) - (cpuUsageEpoch % AN_HOUR));

        if (diff < smallestDiff) {
          smallestDiff = diff;
          closest = threadDump;
        }
      });

    if (closest == null) {
      closest = new ThreadDump(cpuUsageEpoch);
      this.threadDumps.push(closest);
    }

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

    cpuUsage.getThreadCpuUsages().forEach((cpu) => {
      const thread = AsyncParser.findThreadWithId(threadDump, cpu.id);

      if (thread) {
        thread.cpuUsage = cpu.getCpuUsage();
        thread.runningFor = cpu.runningFor;
      }
    });
  }

  private static findThreadWithId(threadDump: ThreadDump, id: number): Thread | undefined {
    return threadDump.threads.find((thread) => thread.id === id);
  }

  private reportProgress(phase: ParseProgress['phase'], linesProcessed: number, totalLines: number): void {
    if (!this.onProgress) return;

    const fileProgress = (this.filesProcessed / this.filesToParse) * 100;
    const maxLineContribution = 100 / this.filesToParse;
    const lineProgress = (linesProcessed / totalLines) * maxLineContribution;

    let percentage: number;
    if (phase === 'complete') {
      percentage = 100;
    } else if (phase === 'grouping') {
      percentage = 95; // Almost done
    } else {
      percentage = (fileProgress + lineProgress) * 0.95;
    }

    this.onProgress({
      phase,
      fileName: this.currentFileName,
      filesProcessed: this.filesProcessed,
      totalFiles: this.filesToParse,
      linesProcessed,
      totalLines,
      percentage: Math.min(100, Math.max(0, percentage)),
    });
  }
}
