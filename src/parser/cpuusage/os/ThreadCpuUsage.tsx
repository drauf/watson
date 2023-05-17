export default class ThreadCpuUsage {
  public readonly id: number;

  public readonly cpuUsage: number;

  public readonly runningFor: string;

  constructor(id: number, cpuUsage: number, runningFor: string) {
    this.id = id;
    this.cpuUsage = cpuUsage;
    this.runningFor = runningFor;
  }
}
