import * as React from 'react';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';
import CpuConsumer from './CpuConsumer';
import CpuConsumersList from './CpuConsumersList';
import CpuConsumersSettings from './CpuConsumersSettings';

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
  limit: number;
  consumers: CpuConsumer[];
}

export default class CpuConsumers extends React.Component<CpuConsumersProps, CpuConsumersState> {
  public state: CpuConsumersState = {
    consumers: [],
    limit: 40,
    mode: CpuConsumersMode.Mean
  };

  public componentDidMount() {
    this.calculateConsumers(this.state.mode);
  }

  public handleModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const mode: CpuConsumersMode = parseInt(event.target.value, 10);
    this.setState({ mode });
    this.calculateConsumers(mode);
  }

  public handleLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const limit: number = parseInt(event.target.value, 10);
    this.setState({ limit });
  }

  public calculateConsumers(mode: CpuConsumersMode) {
    const consumers: CpuConsumer[] = [];
    const threadsOverTime: Map<number, Thread[]> = this.getThreadsOverTime(this.props.threadDumps);

    for (const [id, threads] of threadsOverTime) {
      consumers.push(new CpuConsumer(this.calculateValueFromThreads(threads, mode), threads))
    }
    consumers.sort((a, b) => b.calculatedValue - a.calculatedValue);

    this.setState({ consumers });
  }

  public render() {
    return (
      <>
        <CpuConsumersSettings
          mode={this.state.mode}
          limit={this.state.limit}
          onModeChange={this.handleModeChange}
          onLimitChange={this.handleLimitChange} />
        <CpuConsumersList limit={this.state.limit} consumers={this.state.consumers} />
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
