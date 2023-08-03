export default class ThreadCpuUsage {
  public readonly id: number;

  public readonly runningFor: string;

  private readonly cpuUserMode: number;

  private readonly cpuSystemMode?: number;

  constructor(id: number, runningFor: string, cpuUserMode: number, cpuSystemMode?: number) {
    this.id = id;
    this.cpuUserMode = cpuUserMode;
    this.cpuSystemMode = cpuSystemMode;
    this.runningFor = runningFor;
  }

  public getCpuUsage(): number {
    if (this.cpuSystemMode === undefined) {
      return this.cpuUserMode;
    }

    return this.cpuUserMode + this.cpuSystemMode;
  }
}
