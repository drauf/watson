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
  nameFilter: string;
  stackFilter: string;
};

class CpuConsumersPage extends PageWithSettings<WithThreadDumpsProps, State> {
  constructor(props: WithThreadDumpsProps) {
    super(props);

    const nonEmptyThreadDumps = this.props.threadDumps.filter((dump) => dump.threads.length > 0);

    this.state = {
      limit: 40,
      mode: CpuConsumersMode.Mean,
      threadDumps: nonEmptyThreadDumps,
      nameFilter: '',
      stackFilter: '',
    };
  }

  public override render(): JSX.Element {
    const consumers = this.calculateCpuUsages(this.state.mode);

    if (!this.state.threadDumps.some((dump) => dump.threads.some((thread) => thread.cpuUsage !== '0.00'))) {
      return <NoCpuInfosAndThreadDumpPairError />;
    }

    return (
      <main>
        <CpuConsumersSettings
          mode={this.state.mode}
          limit={this.state.limit}
          nameFilter={this.state.nameFilter}
          stackFilter={this.state.stackFilter}
          onModeChange={this.handleModeChange}
          onLimitChange={this.handleIntegerChange}
          onRegExpChange={this.handleTextChange}
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
    const filteredThreadsOverTime = this.filterThreadsOverTime(threadsOverTime);

    for (const threads of filteredThreadsOverTime) {
      consumers.push(this.calculateUsageFor(threads, calculationMode));
    }
    consumers.sort((a, b) => b.calculatedValue - a.calculatedValue);

    return consumers;
  };

  private filterThreadsOverTime = (threadsOverTime: Array<Map<number, Thread>>): Array<Map<number, Thread>> => {
    if (!this.state.nameFilter && !this.state.stackFilter) {
      return threadsOverTime;
    }

    return threadsOverTime.map((threadsMap) => {
      const filteredMap = new Map<number, Thread>();
      
      for (const [threadId, thread] of threadsMap.entries()) {
        if (this.matchesFilters(thread)) {
          filteredMap.set(threadId, thread);
        }
      }
      
      return filteredMap;
    }).filter((threadsMap) => threadsMap.size > 0);
  };

  private matchesFilters = (thread: Thread): boolean => {
    if (this.state.nameFilter && !this.matchesNameFilter(thread)) {
      return false;
    }
    
    if (this.state.stackFilter && !this.matchesStackFilter(thread)) {
      return false;
    }
    
    return true;
  };

  private matchesNameFilter = (thread: Thread): boolean => {
    try {
      const regex = new RegExp(this.state.nameFilter, 'i');
      return regex.test(thread.name);
    } catch {
      return true; // ignore invalid regex
    }
  };

  private matchesStackFilter = (thread: Thread): boolean => {
    try {
      const regex = new RegExp(this.state.stackFilter, 'i');
      return thread.stackTrace.some(line => regex.test(line));
    } catch {
      return true; // ignore invalid regex
    }
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
