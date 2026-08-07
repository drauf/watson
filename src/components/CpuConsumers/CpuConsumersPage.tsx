import type { JSX } from 'react';
import { calculateCpuConsumers, CpuConsumerFilters } from './cpuConsumerCalculation';
import { defaultThreadLabelFilterState, ThreadLabelFilterState } from '../../common/threadLabelFiltering';
import { WithThreadDumpsProps, withAllThreadDumps } from '../../common/withThreadDumps';
import ThreadDump from '../../types/ThreadDump';
import EmptyState from '../Errors/EmptyState';
import NoCpuInfosAndThreadDumpPairError from '../Errors/NoCpuInfosAndThreadDumpPairError';
import PageWithSettings from '../PageWithSettings';
import CpuConsumer from './CpuConsumer';
import CpuConsumersList from './CpuConsumersList';
import CpuConsumersSettings from './CpuConsumersSettings';
import CpuConsumersMode from './CpuConsumersMode';
import './CpuConsumersPage.css';

interface State extends ThreadLabelFilterState {
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
      ...defaultThreadLabelFilterState,
    };
  }

  public override render(): JSX.Element {
    const filters: CpuConsumerFilters = this.state;
    const consumers = calculateCpuConsumers(this.state.threadDumps, this.state.mode, filters);

    if (!this.state.threadDumps.some((dump) => dump.threads.some((thread) => thread.cpuUsage !== '0.00'))) {
      return <NoCpuInfosAndThreadDumpPairError />;
    }

    return (
      <main>
        <CpuConsumersSettings
          mode={this.state.mode}
          nameFilter={this.state.nameFilter}
          stackFilter={this.state.stackFilter}
          http={this.state.http}
          background={this.state.background}
          indexSearch={this.state.indexSearch}
          database={this.state.database}
          userDirectory={this.state.userDirectory}
          cpuActive={this.state.cpuActive}
          onModeChange={this.handleModeChange}
          onFilterChange={this.handleFilterChange}
          onRegExpChange={this.handleTextChange}
        />

        {this.renderConsumers(consumers)}
      </main>
    );
  }

  private renderConsumers = (consumers: CpuConsumer[]): JSX.Element => {
    if (consumers.length === 0) {
      return (
        <EmptyState />
      );
    }

    return (
      <CpuConsumersList
        dumpsNumber={this.state.threadDumps.length}
        consumers={consumers}
        resetKey={`${this.state.mode}:${this.state.nameFilter}:${this.state.stackFilter}:${this.state.http}:${this.state.background}:${this.state.indexSearch}:${this.state.database}:${this.state.userDirectory}:${this.state.cpuActive}:${this.state.threadDumps.length}`}
      />
    );
  };

  private handleModeChange = (mode: CpuConsumersMode): void => {
    this.setState({ mode });
  };
}

export default withAllThreadDumps(CpuConsumersPage);
