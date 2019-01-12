import Thread from "../../types/Thread";

export default class CpuConsumer {
  public calculatedValue: number;
  public threadOccurences: Thread[];

  constructor(calculatedValue: number, threadOccurences: Thread[]) {
    this.calculatedValue = calculatedValue;
    this.threadOccurences = threadOccurences;
  }
}
