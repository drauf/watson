import LoadAverages from './LoadAverage';
import Lock from './Lock';
import MemoryUsage from './MemoryUsage';
import Thread from './Thread';

export default class ThreadDump {
  public static getFormattedTime = (threadDump: ThreadDump): string => {
    return threadDump.epoch ? new Date(threadDump.epoch).toLocaleTimeString() : 'unknown time';
  }

  public loadAverages!: LoadAverages | null;
  public runningProcesses!: number;
  public memoryUsage!: MemoryUsage;
  public threads: Thread[] = [];
  public locks: Lock[] = [];
  private epoch!: number | null;

  constructor(date: string | null) {
    if (!date) {
      this.epoch = null;
      return;
    }

    // we want to create a date like below, but we can't because Safari throws "Invalid Date"
    // this.epoch = new Date(date).valueOf();
    const hours = parseInt(date.substring(11, 13), 10);
    const minutes = parseInt(date.substring(14, 16), 10);
    const seconds = parseInt(date.substring(17), 10);
    this.epoch = hours * 3600000 + minutes * 60000 + seconds * 1000;
  }

  public getEpoch = () => {
    return this.epoch;
  }
}
