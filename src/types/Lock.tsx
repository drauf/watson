import Thread from './Thread';

export default class Lock {
  public readonly id: string;

  public readonly className: string;

  private readonly waiting: Thread[] = [];

  public readonly owner?: Thread;

  constructor(id: string, className: string, owner?: Thread) {
    this.id = Lock.parseId(id);
    this.className = className;
    this.owner = owner;
  }

  public hasId(id: string): boolean {
    const parsed = Lock.parseId(id);
    return this.id === parsed;
  }

  public addWaiting(thread: Thread): void {
    this.waiting.push(thread);
  }

  public getWaiting(): Thread[] {
    return this.waiting.slice();
  }

  private static parseId(id: string): string {
    // convert to number and back to hex to get rid of trailing 0s
    const asNumber = parseInt(id, 16);
    return `0x${asNumber.toString(16)}`;
  }
}
