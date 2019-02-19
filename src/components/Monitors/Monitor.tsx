import Lock from '../../types/Lock';
import Thread from '../../types/Thread';

export default class Monitor {
  public date: Date | null;
  public javaClass: string;
  public owner: Thread | null;
  public waiting: Thread[];

  public constructor(date: Date | null, lock: Lock) {
    this.date = date;
    this.javaClass = lock.className;
    this.owner = lock.owner;
    this.waiting = lock.waiting;
  }
}
