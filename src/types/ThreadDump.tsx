import LoadAverages from "./LoadAverage";
import Lock from "./Lock";
import MemoryUsage from "./MemoryUsage";
import Thread from "./Thread";

export default class ThreadDump {
  public date!: Date | null;
  public loadAverages!: LoadAverages | null;
  public memoryUsage!: MemoryUsage;
  public threads: Thread[] = [];
  public locks: Lock[] = [];
}
