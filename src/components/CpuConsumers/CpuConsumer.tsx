import Thread from '../../types/Thread';

export default class CpuConsumer {
  public calculatedValue: number;

  public threadOccurences: Map<number, Thread>;

  constructor(calculatedValue: number, threadOccurences: Map<number, Thread>) {
    this.calculatedValue = calculatedValue;
    this.threadOccurences = threadOccurences;
  }
}
