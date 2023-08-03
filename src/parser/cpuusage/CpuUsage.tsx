import LoadAverages from '../../types/LoadAverage';
import MemoryUsage from '../../types/MemoryUsage';
import ThreadCpuUsage from './ThreadCpuUsage';

export default class CpuUsage {
  public readonly epoch: number;

  public readonly runningProcesses: number;

  private readonly threadCpuUsages: ThreadCpuUsage[];

  public readonly loadAverages?: LoadAverages;

  public readonly memoryUsage?: MemoryUsage;

  private static calculateEpochFromFilename(fileName: string): number {
    // filename has a format of yyyy_mm_dd_hh_mm_ss_thread_cpu_utilisation.txt
    const hours = parseInt(fileName.substring(11, 13), 10);
    const minutes = parseInt(fileName.substring(14, 16), 10);
    const seconds = parseInt(fileName.substring(17, 19), 10);

    return hours * 3600000 + minutes * 60000 + seconds * 1000;
  }

  public static fromJfr(fileName: string, runningProcesses: number, threadCpuUsages: ThreadCpuUsage[]): CpuUsage {
    return new CpuUsage(CpuUsage.calculateEpochFromFilename(fileName), runningProcesses, threadCpuUsages);
  }

  private static calculateEpochFromTimestamp(timestamp: string): number {
    // timestamp is in the format of hh:mm:ss, e.g. 09:50:49
    const hours = parseInt(timestamp.substring(0, 2), 10);
    const minutes = parseInt(timestamp.substring(3, 5), 10);
    const seconds = parseInt(timestamp.substring(6), 10);

    return hours * 3600000 + minutes * 60000 + seconds * 1000;
  }

  public static fromTop(timestamp: string, runningProcesses: number, threadCpuUsages: ThreadCpuUsage[], loadAverages: LoadAverages, memoryUsage: MemoryUsage): CpuUsage {
    return new CpuUsage(CpuUsage.calculateEpochFromTimestamp(timestamp), runningProcesses, threadCpuUsages, loadAverages, memoryUsage);
  }

  private constructor(epoch: number, runningProcesses: number, threadCpuUsages: ThreadCpuUsage[], loadAverages?: LoadAverages, memoryUsage?: MemoryUsage) {
    this.epoch = epoch;
    this.loadAverages = loadAverages;
    this.runningProcesses = runningProcesses;
    this.memoryUsage = memoryUsage;
    this.threadCpuUsages = threadCpuUsages;
  }

  public getThreadCpuUsages(): ThreadCpuUsage[] {
    return this.threadCpuUsages.slice();
  }
}
