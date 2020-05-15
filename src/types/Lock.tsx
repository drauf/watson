import Thread from './Thread';

export default class Lock {
  public id: string;
  public className: string;
  public owner: Thread | null = null;
  public waiting: Thread[] = [];

  constructor(id: string, className: string) {
    this.id = this.parseId(id);
    this.className = className;
  }

  private parseId(id: string): string {
    // convert to number and back to hex to get rid of trailing 0s
    const asNumber = parseInt(id, 16);
    return `0x${asNumber.toString(16)}`;
  }
}
