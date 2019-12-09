import React from 'react';
import getThreadsOverTime from '../../common/getThreadsOverTime';
import Thread from '../../types/Thread';
import PageWithSettings from '../PageWithSettings/PageWithSettings';
import CpuConsumer from './CpuConsumer';
import CpuConsumersList from './CpuConsumersList';
import './CpuConsumersPage.css';
import CpuConsumersSettings from './CpuConsumersSettings';

export enum CpuConsumersMode {
  Mean,
  Median,
  Max,
}

type State = {
  mode: CpuConsumersMode;
  limit: number;
};

export default class CpuConsumersPage extends PageWithSettings<State> {

  public state: State = {
    limit: 100,
    mode: CpuConsumersMode.Mean,
  };

  protected PAGE_NAME = 'CPU Consumers';

  public render() {
    const consumers = this.calculateCpuUsages(this.state.mode);

    return (
      <div id="page">
        <CpuConsumersSettings
          mode={this.state.mode}
          limit={this.state.limit}
          onModeChange={this.handleModeChange}
          onLimitChange={this.handleIntegerChange}
        />

        {!this.props.threadDumps.some(dump => !!dump.loadAverages && dump.threads.length > 0)
          ? <h4 dangerouslySetInnerHTML={{ __html: CpuConsumersPage.NO_CPU_AND_THREADS_PAIR }} />
          : <CpuConsumersList
            limit={this.state.limit}
            dumpsNumber={this.props.threadDumps.length}
            consumers={consumers}
          />
        }
      </div>
    );
  }

  private handleModeChange = (mode: number): React.ChangeEventHandler<HTMLInputElement> => () => {
    this.setState({ mode: mode as CpuConsumersMode });
  }

  private calculateCpuUsages(calculationMode: CpuConsumersMode): CpuConsumer[] {
    const consumers: CpuConsumer[] = [];
    const threadsOverTime = getThreadsOverTime(this.props.threadDumps);

    for (const threads of threadsOverTime) {
      consumers.push(this.calculateUsageFor(threads, calculationMode));
    }
    consumers.sort((a, b) => b.calculatedValue - a.calculatedValue);

    return consumers;
  }

  private calculateUsageFor(threadsMap: Map<number, Thread>, calculationMode: CpuConsumersMode) {
    const threads = Array.from(threadsMap.values());

    let usage: number = 0;
    switch (calculationMode) {
      case CpuConsumersMode.Mean:
        usage = threads.reduce(this.reduceSum, 0) / this.props.threadDumps.length;
        break;
      case CpuConsumersMode.Median:
        usage = this.calculateMedian(threads);
        break;
      case CpuConsumersMode.Max:
        usage = threads.reduce(this.reduceMax, 0);
        break;
    }

    return new CpuConsumer(usage, threadsMap);
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
