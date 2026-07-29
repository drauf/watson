import React from 'react';
import getThreadsOverTime from '../../common/getThreadsOverTime';
import { matchesRegexFilters } from '../../common/regexFiltering';
import { WithThreadDumpsProps, withAllThreadDumps } from '../../common/withThreadDumps';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';
import NoCpuInfosAndThreadDumpPairError from '../Errors/NoCpuInfosAndThreadDumpPairError';
import PageWithSettings from '../PageWithSettings';
import CpuConsumer from './CpuConsumer';
import { getCpuUsageSummary } from './cpuUsageSummary';
import CpuConsumersList from './CpuConsumersList';
import CpuConsumersSettings from './CpuConsumersSettings';
import CpuConsumersMode from './CpuConsumersMode';
import './CpuConsumersPage.css';

interface State {
  mode: CpuConsumersMode;
  threadDumps: ThreadDump[];
  nameFilter: string;
  stackFilter: string;
}

class CpuConsumersPage extends PageWithSettings<WithThreadDumpsProps, State> {
  constructor(props: WithThreadDumpsProps) {
    super(props);

    const nonEmptyThreadDumps = this.props.threadDumps.filter((dump) => dump.threads.length > 0);

    this.state = {
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
          nameFilter={this.state.nameFilter}
          stackFilter={this.state.stackFilter}
          onModeChange={this.handleModeChange}
          onRegExpChange={this.handleTextChange}
        />

        <CpuConsumersList
          dumpsNumber={this.state.threadDumps.length}
          consumers={consumers}
          resetKey={`${this.state.mode}:${this.state.nameFilter}:${this.state.stackFilter}:${this.state.threadDumps.length}`}
        />
      </main>
    );
  }

  private handleModeChange = (mode: number): React.ChangeEventHandler<HTMLInputElement> => () => {
    this.setState({ mode });
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

  private filterThreadsOverTime = (threadsOverTime: Map<number, Thread>[]): Map<number, Thread>[] => {
    if (!this.state.nameFilter && !this.state.stackFilter) {
      return threadsOverTime;
    }

    return threadsOverTime.map((threadsMap) => {
      const filteredMap = new Map<number, Thread>();

      for (const [threadId, thread] of threadsMap.entries()) {
        if (matchesRegexFilters(thread, this.state.nameFilter, this.state.stackFilter)) {
          filteredMap.set(threadId, thread);
        }
      }

      return filteredMap;
    }).filter((threadsMap) => threadsMap.size > 0);
  };

  private calculateUsageFor = (threadsMap: Map<number, Thread>, calculationMode: CpuConsumersMode) => {
    const summary = getCpuUsageSummary(threadsMap.values(), this.state.threadDumps.length);

    switch (calculationMode) {
      case CpuConsumersMode.Mean:
        return new CpuConsumer(summary.mean, summary, threadsMap);
      case CpuConsumersMode.Median:
        return new CpuConsumer(summary.median, summary, threadsMap);
      case CpuConsumersMode.Max:
        return new CpuConsumer(summary.max, summary, threadsMap);
      default:
        throw new Error(`Unsupported calculation mode: ${calculationMode as CpuConsumersMode}`);
    }
  };
}

export default withAllThreadDumps(CpuConsumersPage);
