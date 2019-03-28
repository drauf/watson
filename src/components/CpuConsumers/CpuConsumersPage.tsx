import React from 'react';
import ReactGA from 'react-ga';
import getThreadsOverTime from '../../common/ThreadDumpsUtils';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';
import { getThreadDumps } from '../threadDumps';
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

export default class CpuConsumersPage extends React.PureComponent<any, State> {

  // tslint:disable-next-line:max-line-length
  private static MISSING_FILES_MESSAGE = 'To see the CPU Consumers you must upload at least one matching pair of threads and cpu_info files.';

  public state: State = {
    limit: 100,
    mode: CpuConsumersMode.Mean,
  };

  private threadDumps: ThreadDump[];

  constructor(props: any) {
    super(props);
    this.threadDumps = getThreadDumps();
  }

  public render() {
    if (!this.threadDumps.find(dump => !!dump.loadAverages && dump.threads.length > 0)) {
      return <h2>{CpuConsumersPage.MISSING_FILES_MESSAGE}</h2>;
    }

    const consumers = this.calculateCpuUsages(this.state.mode);

    return (
      <div id="cpu-consumers-page">
        <CpuConsumersSettings
          mode={this.state.mode}
          limit={this.state.limit}
          onModeChange={this.handleModeChange}
          onLimitChange={this.handleLimitChange}
        />
        <CpuConsumersList
          limit={this.state.limit}
          dumpsNumber={this.threadDumps.length}
          consumers={consumers}
        />
      </div>
    );
  }

  private handleModeChange = (mode: number): React.ChangeEventHandler<HTMLInputElement> => () => {
    ReactGA.event({
      action: 'CPU Consumers settings changed',
      category: 'Navigation',
      label: `Mode changed to ${mode}`,
    });
    this.setState({ mode: mode as CpuConsumersMode });
  }

  private handleLimitChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const limit: number = parseInt(event.target.value, 10);
    ReactGA.event({
      action: 'CPU Consumers settings changed',
      category: 'Navigation',
      label: `Limit changed to ${limit}`,
    });
    this.setState({ limit });
  }

  private calculateCpuUsages(calculationMode: CpuConsumersMode): CpuConsumer[] {
    const consumers: CpuConsumer[] = [];
    const threadsOverTime = getThreadsOverTime(this.threadDumps);

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
        usage = threads.reduce(this.reduceSum, 0) / this.threadDumps.length;
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
