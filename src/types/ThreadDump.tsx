import LoadAverages from './LoadAverage';
import Lock from './Lock';
import MemoryUsage from './MemoryUsage';
import Thread from './Thread';

export default class ThreadDump {
  public static getFormattedTime = (threadDump: ThreadDump): string => (
    new Date(threadDump.epoch).toUTCString().substr(17, 8)
  );

  public static from = (date: string): ThreadDump => {
    // we can't use new Date(date).valueOf() due to Safari not understanding the date format
    const hours = parseInt(date.substring(11, 13), 10);
    const minutes = parseInt(date.substring(14, 16), 10);
    const seconds = parseInt(date.substring(17), 10);
    return new ThreadDump(hours * 3600000 + minutes * 60000 + seconds * 1000);
  };

  public readonly epoch: number;

  public readonly threads: Thread[] = [];

  public readonly locks: Lock[] = [];

  public runningProcesses!: number;

  public memoryUsage!: MemoryUsage;

  public loadAverages!: LoadAverages;

  constructor(epoch: number) {
    this.epoch = epoch;
  }
}
