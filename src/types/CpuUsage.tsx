import LoadAverages from './LoadAverage';
import MemoryUsage from './MemoryUsage';
import ThreadCpuUsage from './ThreadCpuUsage';

export default class CpuUsage {
  public readonly epoch: number;

  public readonly memoryUsage: MemoryUsage;

  public readonly runningProcesses: number;

  private readonly threadCpuUsages: ThreadCpuUsage[];

  public readonly loadAverages?: LoadAverages;

  private static calculateEpoch(timestamp: string): number {
    // timestamp is in the format of hh:mm:ss, e.g. 09:50:49
    const hours = parseInt(timestamp.substring(0, 2), 10);
    const minutes = parseInt(timestamp.substring(3, 5), 10);
    const seconds = parseInt(timestamp.substring(6), 10);

    return hours * 3600000 + minutes * 60000 + seconds * 1000;
  }

  constructor(timestamp: string, memoryUsage: MemoryUsage, runningProcesses: number, threadCpuUsages: ThreadCpuUsage[], loadAverages?: LoadAverages) {
    this.epoch = CpuUsage.calculateEpoch(timestamp);
    this.memoryUsage = memoryUsage;
    this.runningProcesses = runningProcesses;
    this.threadCpuUsages = threadCpuUsages;
    this.loadAverages = loadAverages;
  }

  public getThreadCpuUsages(): ThreadCpuUsage[] {
    return this.threadCpuUsages.slice();
  }
}
