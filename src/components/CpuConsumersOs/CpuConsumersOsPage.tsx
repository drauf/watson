import React from 'react';
import getThreadsOverTime from '../../common/getThreadsOverTime';
import { WithThreadDumpsProps } from '../../common/withThreadDumps';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';
import NoCpuInfosAndThreadDumpPairError from '../Errors/NoCpuInfosAndThreadDumpPairError';
import PageWithSettings from '../PageWithSettings';
import CpuConsumerOs from './CpuConsumerOs';
import CpuConsumersOsList from './CpuConsumersOsList';
import CpuConsumersOsSettings from './CpuConsumersOsSettings';
import CpuConsumersOsMode from './CpuConsumersOsMode';
import './CpuConsumersOsPage.css';

type State = {
  mode: CpuConsumersOsMode;
  limit: number;
  threadDumps: ThreadDump[];
};

export default class CpuConsumersOsPage extends PageWithSettings<WithThreadDumpsProps, State> {
  constructor(props: WithThreadDumpsProps) {
    super(props);

    const nonEmptyThreadDumps = this.props.threadDumps.filter((dump) => dump.threads.length > 0);

    this.state = {
      limit: 40,
      mode: CpuConsumersOsMode.Mean,
      threadDumps: nonEmptyThreadDumps,
    };
  }

  public render(): JSX.Element {
    const consumers = this.calculateCpuUsages(this.state.mode);

    if (!this.state.threadDumps.some((dump) => !!dump.loadAverages)) {
      return <NoCpuInfosAndThreadDumpPairError />;
    }

    return (
      <main>
        <CpuConsumersOsSettings
          mode={this.state.mode}
          limit={this.state.limit}
          onModeChange={this.handleModeChange}
          onLimitChange={this.handleIntegerChange}
        />

        <CpuConsumersOsList
          limit={this.state.limit}
          dumpsNumber={this.state.threadDumps.length}
          consumers={consumers}
        />
      </main>
    );
  }

  private handleModeChange = (mode: number): React.ChangeEventHandler<HTMLInputElement> => () => {
    this.setState({ mode: mode as CpuConsumersOsMode });
  };

  private calculateCpuUsages = (calculationMode: CpuConsumersOsMode): CpuConsumerOs[] => {
    const consumers: CpuConsumerOs[] = [];
    const threadsOverTime = getThreadsOverTime(this.state.threadDumps);

    for (const threads of threadsOverTime) {
      consumers.push(this.calculateUsageFor(threads, calculationMode));
    }
    consumers.sort((a, b) => b.calculatedValue - a.calculatedValue);

    return consumers;
  };

  private calculateUsageFor = (threadsMap: Map<number, Thread>, calculationMode: CpuConsumersOsMode) => {
    const threads = Array.from(threadsMap.values());

    let usage = 0;
    switch (calculationMode) {
      case CpuConsumersOsMode.Mean:
        usage = threads.reduce(CpuConsumersOsPage.reduceSum, 0) / this.state.threadDumps.length;
        break;
      case CpuConsumersOsMode.Median:
        usage = CpuConsumersOsPage.calculateMedian(threads);
        break;
      case CpuConsumersOsMode.Max:
        usage = threads.reduce(CpuConsumersOsPage.reduceMax, 0);
        break;
      default:
        throw new Error(`Unsupported calculation mode: ${calculationMode as CpuConsumersOsMode}`);
    }

    return new CpuConsumerOs(usage, threadsMap);
  };

  private static reduceSum = (sum: number, currentThread: Thread): number => sum + currentThread.cpuUsage;

  private static reduceMax = (maxValue: number, currentThread: Thread): number => ((currentThread.cpuUsage > maxValue) ? currentThread.cpuUsage : maxValue);

  private static calculateMedian = (threads: Thread[]): number => {
    const values = threads.slice();
    values.sort((a, b) => a.cpuUsage - b.cpuUsage);
    const lowMiddle = Math.floor((values.length - 1) / 2);
    const highMiddle = Math.ceil((values.length - 1) / 2);
    return (values[lowMiddle].cpuUsage + values[highMiddle].cpuUsage) / 2;
  };
}
