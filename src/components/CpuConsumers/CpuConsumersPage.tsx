import React from 'react';
import getThreadsOverTime from '../../common/getThreadsOverTime';
import { WithThreadDumpsProps, withThreadDumps } from '../../common/withThreadDumps';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';
import NoCpuInfosAndThreadDumpPairError from '../Errors/NoCpuInfosAndThreadDumpPairError';
import PageWithSettings from '../PageWithSettings';
import CpuConsumer from './CpuConsumer';
import CpuConsumersList from './CpuConsumersList';
import CpuConsumersSettings from './CpuConsumersSettings';
import CpuConsumersMode from './CpuConsumersMode';
import './CpuConsumersPage.css';

type State = {
  mode: CpuConsumersMode;
  limit: number;
  threadDumps: ThreadDump[];
};

class CpuConsumersPage extends PageWithSettings<WithThreadDumpsProps, State> {
  constructor(props: WithThreadDumpsProps) {
    super(props);

    const nonEmptyThreadDumps = this.props.threadDumps.filter((dump) => dump.threads.length > 0);

    this.state = {
      limit: 40,
      mode: CpuConsumersMode.Mean,
      threadDumps: nonEmptyThreadDumps,
    };
  }

  public render(): JSX.Element {
    const consumers = this.calculateCpuUsages(this.state.mode);

    if (!this.state.threadDumps.some((dump) => dump.threads.some((thread) => thread.cpuUsage !== '0.00'))) {
      return <NoCpuInfosAndThreadDumpPairError />;
    }

    return (
      <main>
        <CpuConsumersSettings
          mode={this.state.mode}
          limit={this.state.limit}
          onModeChange={this.handleModeChange}
          onLimitChange={this.handleIntegerChange}
        />

        <CpuConsumersList
          limit={this.state.limit}
          dumpsNumber={this.state.threadDumps.length}
          consumers={consumers}
        />
      </main>
    );
  }

  private handleModeChange = (mode: number): React.ChangeEventHandler<HTMLInputElement> => () => {
    this.setState({ mode: mode as CpuConsumersMode });
  };

  private calculateCpuUsages = (calculationMode: CpuConsumersMode): CpuConsumer[] => {
    const consumers: CpuConsumer[] = [];
    const threadsOverTime = getThreadsOverTime(this.state.threadDumps);

    for (const threads of threadsOverTime) {
      consumers.push(this.calculateUsageFor(threads, calculationMode));
    }
    consumers.sort((a, b) => b.calculatedValue - a.calculatedValue);

    return consumers;
  };

  private calculateUsageFor = (threadsMap: Map<number, Thread>, calculationMode: CpuConsumersMode) => {
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
        throw new Error(`Unsupported calculation mode: ${calculationMode as CpuConsumersMode}`);
    }

    return new CpuConsumer(usage, threadsMap);
  };

  private static reduceSum = (sum: number, currentThread: Thread): number => sum + parseFloat(currentThread.cpuUsage);

  private static reduceMax = (maxValue: number, currentThread: Thread): number => ((parseFloat(currentThread.cpuUsage) > maxValue) ? parseFloat(currentThread.cpuUsage) : maxValue);

  private static calculateMedian = (threads: Thread[]): number => {
    const values = threads.slice();
    values.sort((a, b) => parseFloat(a.cpuUsage) - parseFloat(b.cpuUsage));
    const lowMiddle = Math.floor((values.length - 1) / 2);
    const highMiddle = Math.ceil((values.length - 1) / 2);
    return (parseFloat(values[lowMiddle].cpuUsage) + parseFloat(values[highMiddle].cpuUsage)) / 2;
  };
}

export default withThreadDumps(CpuConsumersPage);
