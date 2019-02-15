import Lock from './Lock';
import ThreadStatus from './ThreadStatus';

export default class Thread {
  public id!: number;
  public name!: string;
  public date: Date | null;
  public status!: ThreadStatus;
  public cpuUsage: number = 0.0;
  public runningFor!: string;
  public lockWaitingFor!: Lock;
  public locksHeld: Lock[] = [];
  public classicalLocksHeld: Lock[] = [];
  public meaningfulLinesNumber!: number;
  public stackTrace: string[] = [];
  public matchingFilter: boolean = false;

  constructor(date: Date | null) {
    this.date = date;
  }
}
