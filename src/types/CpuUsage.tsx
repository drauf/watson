import LoadAverages from './LoadAverage';
import MemoryUsage from './MemoryUsage';
import ThreadCpuUsage from './ThreadCpuUsage';

export default class CpuUsage {
  public runningProcesses!: number;
  public loadAverages!: LoadAverages | null;
  public memoryUsage!: MemoryUsage;
  public threadCpuUsages!: ThreadCpuUsage[];
  private epoch: number | null;

  constructor(epoch: number | null) {
    this.epoch = epoch;
  }

  public getEpoch = () => {
    return this.epoch;
  }
}
