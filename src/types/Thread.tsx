import Lock from './Lock';
import ThreadStatus from './ThreadStatus';

export default class Thread {
  public id: number;
  public name: string;
  public date: Date | null;
  public status: ThreadStatus | undefined;
  public cpuUsage: number = 0.0;
  public runningFor!: string;
  public lockWaitingFor: Lock | null = null;
  public locksHeld: Lock[] = [];
  public classicalLocksHeld: Lock[] = [];
  public stackTrace: string[] = [];
  public matchingFilter: boolean = false;

  constructor(id: number, name: string, date: Date | null) {
    this.id = id;
    this.name = name;
    this.date = date;
  }
}
