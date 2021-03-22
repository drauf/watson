import Lock from './Lock';
import ThreadStatus from './ThreadStatus';
import TypeWithUniqueId from './TypeWithUniqueId';

export default class Thread extends TypeWithUniqueId {
  public static getFormattedTime = (thread: Thread): string => (thread.epoch
    ? new Date(thread.epoch).toUTCString().substr(17, 8)
    : '');

  public id: number;

  public name: string;

  public status?: ThreadStatus;

  public cpuUsage = 0.0;

  public runningFor!: string;

  public lockWaitingFor?: Lock;

  public locksHeld: Lock[] = [];

  public classicalLocksHeld: Lock[] = [];

  public stackTrace: string[] = [];

  public matchingFilter = false;

  private epoch?: number;

  constructor(id: number, name: string, epoch?: number) {
    super();
    this.id = id;
    this.name = name;
    this.epoch = epoch;
  }
}
