import Thread from './Thread';

export default class Lock {
  public readonly id: string;

  public readonly className: string;

  public readonly waiting: Thread[] = [];

  public owner?: Thread;

  constructor(id: string, className: string, owner?: Thread) {
    this.id = Lock.parseId(id);
    this.className = className;
    if (owner !== undefined) {
      this.owner = owner;
    }
  }

  public hasId(id: string): boolean {
    const parsed = Lock.parseId(id);
    return this.id === parsed;
  }

  public addWaiting(thread: Thread): void {
    this.waiting.push(thread);
  }

  public setOwner(owner: Thread): void {
    this.owner = owner;
  }

  private static parseId(id: string): string {
    // convert to number and back to hex to get rid of trailing 0s
    const asNumber = parseInt(id, 16);
    return `0x${asNumber.toString(16)}`;
  }
}
