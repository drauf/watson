import Lock from './Lock';
import ThreadStatus from './ThreadStatus';
import TypeWithUniqueId from './TypeWithUniqueId';

export default class Thread extends TypeWithUniqueId {
  public static getFormattedTime = (thread: Thread): string => (thread.epoch
    ? new Date(thread.epoch).toUTCString().substr(17, 8)
    : '');

  public readonly id: number;

  public readonly name: string;

  public readonly locksHeld: Lock[] = [];

  public readonly classicalLocksHeld: Lock[] = [];

  public readonly stackTrace: string[] = [];

  public status = ThreadStatus.UNKNOWN as ThreadStatus;

  public cpuUsage = 0.0;

  public runningFor = '0:00.00';

  public lockWaitingFor?: Lock;

  private readonly epoch?: number;

  constructor(id: number, name: string, epoch?: number) {
    super();
    this.id = id;
    this.name = name;
    this.epoch = epoch;
  }
}
