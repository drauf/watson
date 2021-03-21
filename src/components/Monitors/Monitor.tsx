import Lock from '../../types/Lock';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';

export default class Monitor {
  public time: string;

  public javaClass: string;

  public owner?: Thread;

  public waiting: Thread[];

  public constructor(threadDump: ThreadDump, lock: Lock) {
    this.time = ThreadDump.getFormattedTime(threadDump);
    this.javaClass = lock.className;
    this.owner = lock.owner;
    this.waiting = lock.getWaiting();
  }
}
