import LoadAverages from './LoadAverage';
import MemoryUsage from './MemoryUsage';
import ThreadCpuUsage from './ThreadCpuUsage';

export default class CpuUsage {
  public runningProcesses!: number;

  public loadAverages!: LoadAverages | null;

  public memoryUsage!: MemoryUsage;

  public threadCpuUsages!: ThreadCpuUsage[];

  private epoch: number | null;

  constructor(timestamp: string) {
    // timestamp is in the format of hh:mm:ss, e.g. 09:50:49
    const hours = parseInt(timestamp.substring(0, 2), 10);
    const minutes = parseInt(timestamp.substring(3, 5), 10);
    const seconds = parseInt(timestamp.substring(6), 10);

    this.epoch = hours * 3600000 + minutes * 60000 + seconds * 1000;
  }

  public getEpoch = (): number | null => this.epoch
}
