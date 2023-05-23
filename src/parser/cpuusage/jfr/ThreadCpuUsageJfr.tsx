export default class ThreadCpuUsageJfr {
  public readonly jvmThreadId: string;

  public readonly osThreadId: string;

  public readonly threadName: string;

  public readonly cpuUserMode: string;

  public readonly cpuSystemMode: string;

  public readonly systemTime: string;

  constructor(
    jvmThreadId: string,
    osThreadId: string,
    threadName: string,
    cpuUserMode: string,
    cpuSystemMode: string,
    systemTime: string,
  ) {
    this.jvmThreadId = jvmThreadId;
    this.osThreadId = osThreadId;
    this.threadName = threadName;
    this.cpuUserMode = cpuUserMode;
    this.cpuSystemMode = cpuSystemMode;
    this.systemTime = systemTime;
  }
}
