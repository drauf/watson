import React from 'react';
import ThreadDumpsUtils from '../../common/ThreadDumpsUtils';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';
import CpuConsumer from './CpuConsumer';
import CpuConsumersList from './CpuConsumersList';
import CpuConsumersSettings from './CpuConsumersSettings';

export enum CpuConsumersMode {
  Mean,
  Median,
  Max,
}

type CpuConsumersPageProps = {
  threadDumps: ThreadDump[];
};

type CpuConsumersPageState = {
  mode: CpuConsumersMode;
  limit: number;
  consumers: CpuConsumer[];
};

export default class CpuConsumersPage
  extends React.PureComponent<CpuConsumersPageProps, CpuConsumersPageState> {

  public state: CpuConsumersPageState = {
    consumers: [],
    limit: 60,
    mode: CpuConsumersMode.Mean,
  };

  public componentDidMount() {
    this.calculateConsumers(this.state.mode);
  }

  public handleModeChange = (mode: number): React.ChangeEventHandler<HTMLInputElement> => () => {
    this.setState({ mode: mode as CpuConsumersMode });
    this.calculateConsumers(mode);
  }

  public handleLimitChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const limit: number = parseInt(event.target.value, 10);
    this.setState({ limit });
  }

  public calculateConsumers(mode: CpuConsumersMode) {
    const consumers: CpuConsumer[] = [];
    const threadsOverTime = ThreadDumpsUtils.getThreadsOverTime(this.props.threadDumps);

    for (const threads of threadsOverTime) {
      consumers.push(new CpuConsumer(this.calculateValueFromThreads(threads, mode), threads));
    }
    consumers.sort((a, b) => b.calculatedValue - a.calculatedValue);

    this.setState({ consumers });
  }

  public render() {
    return (
      <div className="content">
        <CpuConsumersSettings
          mode={this.state.mode}
          limit={this.state.limit}
          onModeChange={this.handleModeChange}
          onLimitChange={this.handleLimitChange}
        />
        <CpuConsumersList
          limit={this.state.limit}
          dumpsNumber={this.props.threadDumps.length}
          consumers={this.state.consumers}
        />
      </div>
    );
  }

  private calculateValueFromThreads(threadsMap: Map<number, Thread>, mode: CpuConsumersMode) {
    const threads = Array.from(threadsMap.values());

    switch (mode) {
      case CpuConsumersMode.Mean:
        return threads.reduce(this.reduceSum, 0) / this.props.threadDumps.length;
      case CpuConsumersMode.Median:
        return this.calculateMedian(threads);
      case CpuConsumersMode.Max:
        return threads.reduce(this.reduceMax, 0);
    }
  }

  private reduceSum(sum: number, currentThread: Thread): number {
    return sum + currentThread.cpuUsage;
  }

  private reduceMax(maxValue: number, currentThread: Thread): number {
    return (currentThread.cpuUsage > maxValue) ? currentThread.cpuUsage : maxValue;
  }

  private calculateMedian(threads: Thread[]): number {
    const values = threads.slice();
    values.sort((a, b) => a.cpuUsage - b.cpuUsage);
    const lowMiddle = Math.floor((values.length - 1) / 2);
    const highMiddle = Math.ceil((values.length - 1) / 2);
    return (values[lowMiddle].cpuUsage + values[highMiddle].cpuUsage) / 2;
  }
}
