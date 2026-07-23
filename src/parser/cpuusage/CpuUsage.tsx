import LoadAverages from '../../types/LoadAverage';
import MemoryUsage from '../../types/MemoryUsage';
import ThreadCpuUsage from './ThreadCpuUsage';
import { tryGetEpochFromFileName } from '../TimestampParser';

export type CpuUsageTimestampKind = 'absolute' | 'time-of-day';

export default class CpuUsage {
  public readonly epoch: number;

  public readonly timestampKind: CpuUsageTimestampKind;

  public readonly runningProcesses: number;

  private readonly threadCpuUsages: ThreadCpuUsage[];

  public readonly loadAverages?: LoadAverages;

  public readonly memoryUsage?: MemoryUsage;

  public static fromJfr(fileName: string, runningProcesses: number, threadCpuUsages: ThreadCpuUsage[]): CpuUsage {
    return new CpuUsage(
      tryGetEpochFromFileName(fileName) ?? 0,
      'absolute',
      runningProcesses,
      threadCpuUsages,
    );
  }

  private static calculateEpochFromTimestamp(timestamp: string): number {
    // timestamp is in the format of hh:mm:ss, e.g. 09:50:49
    const hours = parseInt(timestamp.substring(0, 2), 10);
    const minutes = parseInt(timestamp.substring(3, 5), 10);
    const seconds = parseInt(timestamp.substring(6), 10);

    return hours * 3600000 + minutes * 60000 + seconds * 1000;
  }

  public static fromTop(timestamp: string, runningProcesses: number, threadCpuUsages: ThreadCpuUsage[], loadAverages: LoadAverages, memoryUsage: MemoryUsage): CpuUsage {
    return new CpuUsage(
      CpuUsage.calculateEpochFromTimestamp(timestamp),
      'time-of-day',
      runningProcesses,
      threadCpuUsages,
      loadAverages,
      memoryUsage,
    );
  }

  private constructor(
    epoch: number,
    timestampKind: CpuUsageTimestampKind,
    runningProcesses: number,
    threadCpuUsages: ThreadCpuUsage[],
    loadAverages?: LoadAverages,
    memoryUsage?: MemoryUsage,
  ) {
    this.epoch = epoch;
    this.timestampKind = timestampKind;
    if (loadAverages !== undefined) {
      this.loadAverages = loadAverages;
    }
    this.runningProcesses = runningProcesses;
    if (memoryUsage !== undefined) {
      this.memoryUsage = memoryUsage;
    }
    this.threadCpuUsages = threadCpuUsages;
  }

  public getThreadCpuUsages(): ThreadCpuUsage[] {
    return this.threadCpuUsages.slice();
  }
}
