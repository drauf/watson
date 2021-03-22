import TypeWithUniqueId from '../../types/TypeWithUniqueId';
import Monitor from './Monitor';

export default class MonitorOverTime extends TypeWithUniqueId {
  public id: string;

  public waitingSum = 0;

  public monitors: Monitor[] = [];

  public constructor(id: string) {
    super();
    this.id = id;
  }
}
