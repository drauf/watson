import Thread from '../../types/Thread';
import TypeWithUniqueId from '../../types/TypeWithUniqueId';

export default class CpuConsumer extends TypeWithUniqueId {
  public readonly calculatedValue: number;

  public readonly threadOccurences: Map<number, Thread>;

  constructor(calculatedValue: number, threadOccurences: Map<number, Thread>) {
    super();
    this.calculatedValue = calculatedValue;
    this.threadOccurences = threadOccurences;
  }
}
