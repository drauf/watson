import Lock from '../../types/Lock';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';
import TypeWithUniqueId from '../../types/TypeWithUniqueId';

export default class Monitor extends TypeWithUniqueId {
  public time: string;

  public javaClass: string;

  public owner?: Thread;

  public waiting: Thread[];

  public constructor(threadDump: ThreadDump, lock: Lock) {
    super();
    this.time = ThreadDump.getFormattedTime(threadDump);
    this.javaClass = lock.className;
    this.owner = lock.owner;
    this.waiting = lock.waiting;
  }
}
