import CurrentCpuUsage from "./CurrentCpuUsage";
import LoadAverages from "./LoadAverage";
import MemoryUsage from "./MemoryUsage";
import ThreadCpuUsage from "./ThreadCpuUsage";

export default class CpuUsage {
  public date!: Date | null;
  public currentCpuUsage: CurrentCpuUsage | undefined;
  public loadAverages!: LoadAverages | null;
  public memoryUsage!: MemoryUsage;
  public threadCpuUsages!: ThreadCpuUsage[];
}
