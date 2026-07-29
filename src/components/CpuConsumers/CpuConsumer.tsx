import Thread from '../../types/Thread';
import TypeWithUniqueId from '../../types/TypeWithUniqueId';
import { CpuUsageSummary } from './cpuUsageSummary';

export default class CpuConsumer extends TypeWithUniqueId {
  public readonly calculatedValue: number;

  public readonly summary: CpuUsageSummary;

  public readonly threadOccurrences: Map<number, Thread>;

  constructor(calculatedValue: number, summary: CpuUsageSummary, threadOccurrences: Map<number, Thread>) {
    super();
    this.calculatedValue = calculatedValue;
    this.summary = summary;
    this.threadOccurrences = threadOccurrences;
  }
}
