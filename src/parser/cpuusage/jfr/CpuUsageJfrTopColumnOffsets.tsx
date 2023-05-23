export default class CpuUsageJfrTopColumnOffsets {
  private jvmThreadId = 0;

  private osThreadId = 0;

  private cpuUserMode = 0;

  private cpuSystemMode = 0;

  private systemTime = 0;

  private threadName = 0;

  public getJvmThreadIdOffset(): number {
    return this.jvmThreadId;
  }

  public setJvmThreadIdOffset(offset: number): void {
    this.jvmThreadId = offset;
  }

  public getOsThreadIdOffset(): number {
    return this.osThreadId;
  }

  public setOsThreadIdOffset(offset: number): void {
    this.osThreadId = offset;
  }

  public getCpuUserModeOffset(): number {
    return this.cpuUserMode;
  }

  public setCpuUserModeOffset(offset: number): void {
    this.cpuUserMode = offset;
  }

  public getCpuSystemModeOffset(): number {
    return this.cpuSystemMode;
  }

  public setCpuSystemModeOffset(offset: number): void {
    this.cpuSystemMode = offset;
  }

  public getSystemTimeOffset(): number {
    return this.systemTime;
  }

  public setSystemTimeOffset(offset: number): void {
    this.systemTime = offset;
  }

  public getThreadNameOffset(): number {
    return this.threadName;
  }

  public setThreadNameOffset(offset: number): void {
    this.threadName = offset;
  }

  public getMaxIndex() {
    return Math.max(this.jvmThreadId, this.osThreadId, this.cpuUserMode, this.cpuSystemMode, this.systemTime, this.threadName);
  }
}
