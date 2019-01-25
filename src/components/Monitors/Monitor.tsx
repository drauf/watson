import Lock from '../../types/Lock';
import Thread from '../../types/Thread';

export default class Monitor {
  public date: Date | null = null;
  public className: string = '';
  public owner: Thread | null = null;
  public waiting: Thread[] = [];

  public constructor(date: Date | null, lock: Lock) {
    this.date = date;
    this.className = lock.className;
    this.owner = lock.owner;
    this.waiting = lock.waiting;
  }
}
