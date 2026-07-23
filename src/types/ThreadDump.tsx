import LoadAverages from './LoadAverage';
import Lock from './Lock';
import MemoryUsage from './MemoryUsage';
import Thread from './Thread';
import { getEpochFromDateTime } from '../parser/TimestampParser';

export default class ThreadDump {
  public static getFormattedTime = (threadDump: ThreadDump): string => (
    new Date(threadDump.epoch).toUTCString().substr(17, 8)
  );

  public static from = (dateFromContent: string, epochFromFileName?: number): ThreadDump => (
    new ThreadDump(epochFromFileName ?? getEpochFromDateTime(dateFromContent))
  );

  public readonly epoch: number;

  public readonly threads: Thread[] = [];

  public readonly locks: Lock[] = [];

  public runningProcesses!: number;

  public memoryUsage?: MemoryUsage;

  public loadAverages?: LoadAverages;

  constructor(epoch: number) {
    this.epoch = epoch;
  }
}
