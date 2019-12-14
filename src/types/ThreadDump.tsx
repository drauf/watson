import LoadAverages from './LoadAverage';
import Lock from './Lock';
import MemoryUsage from './MemoryUsage';
import Thread from './Thread';

export default class ThreadDump {
  public static getFormattedTime = (threadDump: ThreadDump): string => {
    return threadDump.epoch ? new Date(threadDump.epoch).toLocaleTimeString() : 'unknown time';
  }

  public static from = (date: string | null): ThreadDump => {
    if (!date) {
      return new ThreadDump();
    }

    // we can't use new Date(date).valueOf() due to Safari not understanding the date format
    const hours = parseInt(date.substring(11, 13), 10);
    const minutes = parseInt(date.substring(14, 16), 10);
    const seconds = parseInt(date.substring(17), 10);
    return ThreadDump.fromEpoch(hours * 3600000 + minutes * 60000 + seconds * 1000);
  }

  public static fromEpoch = (epoch: number | null): ThreadDump => {
    const threadDump = new ThreadDump();
    threadDump.epoch = epoch;
    return threadDump;
  }

  public loadAverages!: LoadAverages | null;
  public runningProcesses!: number;
  public memoryUsage!: MemoryUsage;
  public threads: Thread[] = [];
  public locks: Lock[] = [];
  private epoch: number | null = null;

  private constructor() {
  }

  public getEpoch = () => {
    return this.epoch;
  }
}
