import LoadAverages from './LoadAverage';
import Lock from './Lock';
import MemoryUsage from './MemoryUsage';
import Thread from './Thread';

export default class ThreadDump {
  public static getFormattedDate = (threadDump: ThreadDump): string => {
    return threadDump.epoch ? new Date(threadDump.epoch).toLocaleString() : 'unknown date';
  }

  public static getFormattedTime = (threadDump: ThreadDump): string => {
    return threadDump.epoch ? new Date(threadDump.epoch).toLocaleTimeString() : 'unknown time';
  }

  public loadAverages!: LoadAverages | null;
  public runningProcesses!: number;
  public memoryUsage!: MemoryUsage;
  public threads: Thread[] = [];
  public locks: Lock[] = [];
  private epoch!: number | null;

  constructor(epoch: number | null) {
    this.epoch = epoch;
  }

  public getEpoch = () => {
    return this.epoch;
  }
}
