import Lock from '../../types/Lock';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';
import TypeWithUniqueId from '../../types/TypeWithUniqueId';

export default class Monitor extends TypeWithUniqueId {
  public readonly time: string;

  public readonly javaClass: string;

  public readonly owner?: Thread;

  public readonly waiting: Thread[];

  public constructor(threadDump: ThreadDump, lock: Lock) {
    super();
    this.time = ThreadDump.getFormattedTime(threadDump);
    this.javaClass = lock.className;
    if (lock.owner !== undefined) {
      this.owner = lock.owner;
    }
    this.waiting = lock.waiting;
  }
}
