import React from 'react';
import getThreadsOverTime from '../../common/getThreadsOverTime';
import { WithThreadDumpsProps } from '../../common/withThreadDumps';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';
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
  threadDumps: ThreadDump[];
};

export default class CpuConsumersPage extends PageWithSettings<State> {
  protected PAGE_NAME = 'CPU Consumers';

  constructor(props: WithThreadDumpsProps) {
    super(props);

    const nonEmptyThreadDumps = this.props.threadDumps.filter((dump) => dump.threads.length > 0);

    this.state = {
      limit: 100,
      mode: CpuConsumersMode.Mean,
      threadDumps: nonEmptyThreadDumps,
    };
  }

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

        {!this.state.threadDumps.some((dump) => !!dump.loadAverages)
          ? <h4 dangerouslySetInnerHTML={{ __html: CpuConsumersPage.NO_CPU_AND_THREADS_PAIR }} />
          : (
            <CpuConsumersList
              limit={this.state.limit}
              dumpsNumber={this.state.threadDumps.length}
              consumers={consumers}
            />
          )}
      </div>
    );
  }

  private handleModeChange = (mode: number): React.ChangeEventHandler<HTMLInputElement> => () => {
    this.setState({ mode: mode as CpuConsumersMode });
  }

  private calculateCpuUsages(calculationMode: CpuConsumersMode): CpuConsumer[] {
    const consumers: CpuConsumer[] = [];
    const threadsOverTime = getThreadsOverTime(this.state.threadDumps);

    for (const threads of threadsOverTime) {
      consumers.push(this.calculateUsageFor(threads, calculationMode));
    }
    consumers.sort((a, b) => b.calculatedValue - a.calculatedValue);

    return consumers;
  }

  private calculateUsageFor(threadsMap: Map<number, Thread>, calculationMode: CpuConsumersMode) {
    const threads = Array.from(threadsMap.values());

    let usage = 0;
    switch (calculationMode) {
      case CpuConsumersMode.Mean:
        usage = threads.reduce(CpuConsumersPage.reduceSum, 0) / this.state.threadDumps.length;
        break;
      case CpuConsumersMode.Median:
        usage = CpuConsumersPage.calculateMedian(threads);
        break;
      case CpuConsumersMode.Max:
        usage = threads.reduce(CpuConsumersPage.reduceMax, 0);
        break;
      default:
        throw new Error(`Unsupported calculation mode: ${calculationMode}`);
    }

    return new CpuConsumer(usage, threadsMap);
  }

  private static reduceSum(sum: number, currentThread: Thread): number {
    return sum + currentThread.cpuUsage;
  }

  private static reduceMax(maxValue: number, currentThread: Thread): number {
    return (currentThread.cpuUsage > maxValue) ? currentThread.cpuUsage : maxValue;
  }

  private static calculateMedian(threads: Thread[]): number {
    const values = threads.slice();
    values.sort((a, b) => a.cpuUsage - b.cpuUsage);
    const lowMiddle = Math.floor((values.length - 1) / 2);
    const highMiddle = Math.ceil((values.length - 1) / 2);
    return (values[lowMiddle].cpuUsage + values[highMiddle].cpuUsage) / 2;
  }
}
