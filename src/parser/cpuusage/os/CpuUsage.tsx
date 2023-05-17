import LoadAverages from '../../../types/LoadAverage';
import MemoryUsage from '../../../types/MemoryUsage';
import ThreadCpuUsage from './ThreadCpuUsage';

export default class CpuUsage {
  public readonly epoch: number;

  public readonly loadAverages: LoadAverages;

  public readonly runningProcesses: number;

  public readonly memoryUsage: MemoryUsage;

  private readonly threadCpuUsages: ThreadCpuUsage[];

  private static calculateEpoch(timestamp: string): number {
    // timestamp is in the format of hh:mm:ss, e.g. 09:50:49
    const hours = parseInt(timestamp.substring(0, 2), 10);
    const minutes = parseInt(timestamp.substring(3, 5), 10);
    const seconds = parseInt(timestamp.substring(6), 10);

    return hours * 3600000 + minutes * 60000 + seconds * 1000;
  }

  constructor(timestamp: string, loadAverages: LoadAverages, runningProcesses: number, memoryUsage: MemoryUsage, threadCpuUsages: ThreadCpuUsage[]) {
    this.epoch = CpuUsage.calculateEpoch(timestamp);
    this.loadAverages = loadAverages;
    this.runningProcesses = runningProcesses;
    this.memoryUsage = memoryUsage;
    this.threadCpuUsages = threadCpuUsages;
  }

  public getThreadCpuUsages(): ThreadCpuUsage[] {
    return this.threadCpuUsages.slice();
  }
}
