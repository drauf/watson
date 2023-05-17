import Thread from '../../types/Thread';
import TypeWithUniqueId from '../../types/TypeWithUniqueId';

export default class CpuConsumerOs extends TypeWithUniqueId {
  public readonly calculatedValue: number;

  public readonly threadOccurrences: Map<number, Thread>;

  constructor(calculatedValue: number, threadOccurrences: Map<number, Thread>) {
    super();
    this.calculatedValue = calculatedValue;
    this.threadOccurrences = threadOccurrences;
  }
}
