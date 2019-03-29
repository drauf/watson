import Thread from './Thread';

export default class Lock {
  public id!: string;
  public className!: string;
  public owner: Thread | null = null;
  public waiting: Thread[] = [];
}
