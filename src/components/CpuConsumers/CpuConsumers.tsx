import * as React from 'react';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';
import CpuConsumer from './CpuConsumer';
import ModeSelector from './ModeSelector';

export enum CpuConsumersMode {
  Mean,
  Median,
  Max
}

interface CpuConsumersProps {
  threadDumps: ThreadDump[];
}

interface CpuConsumersState {
  mode: CpuConsumersMode;
  data: CpuConsumer[];
}

class CpuConsumers extends React.Component<CpuConsumersProps, CpuConsumersState> {
  public state: CpuConsumersState = {
    data: [],
    mode: CpuConsumersMode.Mean
  };

  public componentDidMount() {
    this.calculateData(this.state.mode);
  }

  public handleModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const mode: CpuConsumersMode = parseInt(event.target.value, 10);
    this.setState({ mode });
    this.calculateData(mode);
  }

  public calculateData(mode: CpuConsumersMode) {
    const newData: CpuConsumer[] = [];
    const threadsOverTime: Map<number, Thread[]> = this.getThreadsOverTime(this.props.threadDumps);

    for (const [id, threads] of threadsOverTime) {
      newData.push(new CpuConsumer(this.calculateValueFromThreads(threads, mode), threads))
    }
    newData.sort((a, b) => b.calculatedValue - a.calculatedValue);

    this.setState({ data: newData });
  }

  public render() {
    return (
      <>
        <ModeSelector mode={this.state.mode} onChange={this.handleModeChange} />
      </>
    )
  }

  private getThreadsOverTime(threadDumps: ThreadDump[]): Map<number, Thread[]> {
    const threadsOverTime: Map<number, Thread[]> = new Map();

    threadDumps.forEach(threadDump => {
      threadDump.threads.forEach(thread => {
        let threadOccurences: Thread[] | undefined;

        threadOccurences = threadsOverTime.get(thread.id);
        if (!threadOccurences) {
          threadOccurences = [];
        }

        threadOccurences.push(thread);
        threadsOverTime.set(thread.id, threadOccurences);
      })
    })

    return threadsOverTime;
  }

  private calculateValueFromThreads(threads: Thread[], mode: CpuConsumersMode): number {
    switch (mode) {
      case CpuConsumersMode.Mean:
        return threads.reduce(this.reduceSum, 0) / threads.length;
      case CpuConsumersMode.Median:
        return this.calculateMedian(threads);
      case CpuConsumersMode.Max:
        return threads.reduce(this.reduceMax, 0);
    }
  }

  private reduceSum(sum: number, currentThread: Thread): number {
    return sum + currentThread.cpuUsage
  }

  private reduceMax(maxValue: number, currentThread: Thread): number {
    return (currentThread.cpuUsage > maxValue) ? currentThread.cpuUsage : maxValue
  }

  private calculateMedian(threads: Thread[]): number {
    const values = threads.slice();
    values.sort((a, b) => a.cpuUsage - b.cpuUsage);
    const lowMiddle = Math.floor((values.length - 1) / 2);
    const highMiddle = Math.ceil((values.length - 1) / 2);
    return (values[lowMiddle].cpuUsage + values[highMiddle].cpuUsage) / 2;
  }
}

export default CpuConsumers;
