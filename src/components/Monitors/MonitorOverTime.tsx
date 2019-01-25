import Monitor from './Monitor';

export default class MonitorOverTime {
  public id: string;
  public waitingSum: number = 0;
  public monitors: Monitor[] = [];

  public constructor(id: string) {
    this.id = id;
  }
}
