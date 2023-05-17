import ThreadCpuUsageJfr from './ThreadCpuUsageJfr';

export default class CpuUsageJfr {
  public readonly filename: string;

  public readonly threadCpuUsages: ThreadCpuUsageJfr[];

  constructor(filename: string, threadCpuUsages: ThreadCpuUsageJfr[]) {
    this.filename = filename;
    this.threadCpuUsages = threadCpuUsages;
  }
}
