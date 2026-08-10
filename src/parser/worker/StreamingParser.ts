import AsyncThreadDumpParser, { THREAD_DUMP_DATE_PATTERN } from '../AsyncThreadDumpParser';
import type { ParseProgress } from '../ParseProgress';
import type CpuUsage from '../cpuusage/CpuUsage';
import CpuUsageJfrParser from '../cpuusage/jfr/CpuUsageJfrParser';
import TopCpuUsageParser from '../cpuusage/os/TopCpuUsageParser';
import type { PerformanceConfig } from '../PerformanceConfig';
import { calculateParsingPercentage } from '../ProgressCalculator';
import { findCorrespondingThreadDump, groupCpuUsageWithThreadDump, sortThreadDumps } from '../ParsedDataProcessor';
import { matchOne } from '../RegExpUtils';
import { getTextFileKind } from '../TextFileKind';
import { tryGetEpochFromFileName } from '../TimestampParser';
import ThreadDump from '../../types/ThreadDump';
import { readFileLines } from './readFileLines';

// Limits worker-to-main progress messages so UI updates do not dominate parsing
const PROGRESS_UPDATE_INTERVAL_MS = 200;

type ProgressCallback = (progress: ParseProgress) => void;

export default class StreamingParser {
  private readonly threadDumps: ThreadDump[] = [];

  private readonly cpuUsages: CpuUsage[] = [];

  private readonly totalBytes: number;

  private processedBytes = 0;

  private currentFileName = '';

  private currentFileSize = 0;

  private filesProcessed = 0;

  private lastProgressAt = 0;

  private lastPhase: ParseProgress['phase'] | undefined;

  public constructor(
    private readonly files: File[],
    private readonly config: PerformanceConfig,
    private readonly onProgress: ProgressCallback,
  ) {
    this.totalBytes = files.reduce((total, file) => total + file.size, 0);
  }

  public async parse(): Promise<ThreadDump[]> {
    for (const file of this.files) {
      this.currentFileName = file.name;
      this.currentFileSize = file.size;
      // eslint-disable-next-line no-await-in-loop
      await this.parseFile(file);
      this.filesProcessed++;
      this.processedBytes += file.size;
      this.reportProgress('parsing', 0, 0, true);
    }

    this.reportProgress('grouping', 0, 0, true);
    this.groupCpuUsagesWithThreadDumps();
    this.sortThreadDumps();
    this.reportProgress('complete', 0, 0, true);
    return this.threadDumps;
  }

  private async parseFile(file: File): Promise<void> {
    const cpuLines: string[] = [];
    let firstLine: string | undefined;
    let threadDumpLines: string[] | undefined;
    let fileContainsMultipleThreadDumps = false;
    let bytesRead = 0;

    for await (const line of readFileLines(file, (currentBytesRead) => {
      bytesRead = currentBytesRead;
      this.reportProgress('reading', bytesRead, file.size);
    })) {
      firstLine ??= line;
      const isCpuUsageFile = getTextFileKind(firstLine) !== 'thread-dump';

      if (isCpuUsageFile) {
        cpuLines.push(line);
      } else if (matchOne(THREAD_DUMP_DATE_PATTERN, line)) {
        if (threadDumpLines !== undefined) {
          fileContainsMultipleThreadDumps = true;
          await this.parseThreadDump(threadDumpLines, undefined, bytesRead);
        }
        threadDumpLines = [line];
      } else if (threadDumpLines !== undefined) {
        threadDumpLines.push(line);
      }
    }

    if (cpuLines.length > 0) {
      this.parseCpuUsage(file.name, cpuLines);
      return;
    }

    if (threadDumpLines !== undefined) {
      const epochFromFileName = fileContainsMultipleThreadDumps ? undefined : tryGetEpochFromFileName(file.name);
      await this.parseThreadDump(threadDumpLines, epochFromFileName, bytesRead);
    }
  }

  private async parseThreadDump(lines: string[], epochFromFileName: number | undefined, bytesRead: number): Promise<void> {
    this.reportProgress('parsing', bytesRead, this.currentFileSize);
    await AsyncThreadDumpParser.parseThreadDump(
      lines,
      (threadDump) => this.threadDumps.push(threadDump),
      undefined,
      this.config,
      epochFromFileName,
    );
  }

  private parseCpuUsage(fileName: string, lines: string[]): void {
    if (getTextFileKind(lines[0]) === 'top-cpu') {
      TopCpuUsageParser.parseCpuUsage(lines, (cpuUsage) => this.cpuUsages.push(cpuUsage));
    } else {
      CpuUsageJfrParser.parseCpuUsage(fileName, lines, (cpuUsage) => this.cpuUsages.push(cpuUsage));
    }
  }

  private reportProgress(
    phase: ParseProgress['phase'],
    bytesRead: number,
    currentFileBytes: number,
    force = false,
  ): void {
    const now = performance.now();
    if (!force && phase === this.lastPhase && now - this.lastProgressAt < PROGRESS_UPDATE_INTERVAL_MS) {
      return;
    }

    const currentFileFraction = currentFileBytes === 0 ? 0 : bytesRead / currentFileBytes;
    let percentage = calculateParsingPercentage({
      totalBytes: this.totalBytes,
      processedBytes: this.processedBytes,
      currentFileSize: this.currentFileSize,
      currentFileFraction,
      filesProcessed: this.filesProcessed,
      totalFiles: this.files.length,
    });
    if (phase === 'complete') {
      percentage = 100;
    } else if (phase === 'grouping') {
      percentage = 95;
    }

    this.onProgress({
      phase,
      fileName: this.currentFileName,
      filesProcessed: this.filesProcessed,
      totalFiles: this.files.length,
      linesProcessed: 0,
      totalLines: 0,
      percentage: Math.min(100, Math.max(0, percentage)),
    });
    this.lastProgressAt = now;
    this.lastPhase = phase;
  }

  private groupCpuUsagesWithThreadDumps(): void {
    for (const cpuUsage of this.cpuUsages) {
      if (cpuUsage.epoch) {
        const threadDump = findCorrespondingThreadDump(this.threadDumps, cpuUsage);
        groupCpuUsageWithThreadDump(threadDump, cpuUsage);
      }
    }
  }

  private sortThreadDumps(): void {
    sortThreadDumps(this.threadDumps);
  }
}
