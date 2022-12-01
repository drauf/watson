export default class TopColumnOffsets {
  private id = 1;

  private cpuUsage = 8;

  private runningFor = 10;

  public getProcessIdOffset(): number {
    return this.id;
  }

  public setProcessIdOffset(offset: number): void {
    this.id = offset;
  }

  public getCpuUsageOffset(): number {
    return this.cpuUsage;
  }

  public setCpuUsageOffset(offset: number): void {
    this.cpuUsage = offset;
  }

  public getRunningForOffset(): number {
    return this.runningFor;
  }

  public setRunningForOffset(offset: number): void {
    this.runningFor = offset;
  }

  public getMaxIndex() {
    return Math.max(this.id, this.cpuUsage, this.runningFor);
  }
}
