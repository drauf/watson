import LoadAverages from './LoadAverage';
import MemoryUsage from './MemoryUsage';
import ThreadCpuUsage from './ThreadCpuUsage';

export default class CpuUsage {
  public date!: Date | null;
  public runningProcesses!: number;
  public loadAverages!: LoadAverages | null;
  public memoryUsage!: MemoryUsage;
  public threadCpuUsages!: ThreadCpuUsage[];
}
