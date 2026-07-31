import React from 'react';
import EmptyState from '../Errors/EmptyState';
import { getStuckThreadClusters, StuckThreadsFilters } from './stuckThreadClustering';
import { WithThreadDumpsProps, withThreadDumps } from '../../common/withThreadDumps';
import Thread from '../../types/Thread';
import NoThreadDumpsError from '../Errors/NoThreadDumpsError';
import PageWithSettings from '../PageWithSettings';
import PaginatedCollection from '../common/PaginatedCollection';
import StuckThreadsGroup from './StuckThreadsGroup';
import StuckThreadsSettings from './StuckThreadsSettings';
import './StuckThreadsPage.css';

interface State {
  maxDifferingLines: number;
  minClusterSize: number;
  withoutIdle: boolean;
  nameFilter: string;
  stackFilter: string;
}

class StuckThreadsPage extends PageWithSettings<WithThreadDumpsProps, State> {
  constructor(props: WithThreadDumpsProps) {
    super(props);

    const nonEmptyThreadDumps = this.props.threadDumps.filter((dump) => dump.threads.length > 0);

    this.state = {
      maxDifferingLines: 5,
      minClusterSize: nonEmptyThreadDumps.length,
      withoutIdle: true,
      nameFilter: '',
      stackFilter: '',
    };
  }

  public override componentDidUpdate(previousProps: WithThreadDumpsProps): void {
    if (previousProps.threadDumps === this.props.threadDumps) {
      return;
    }

    const previousNonEmptyThreadDumpCount = previousProps.threadDumps.filter((dump) => dump.threads.length > 0).length;
    const currentNonEmptyThreadDumpCount = this.props.threadDumps.filter((dump) => dump.threads.length > 0).length;
    if (this.state.minClusterSize === previousNonEmptyThreadDumpCount) {
      this.setState({ minClusterSize: currentNonEmptyThreadDumpCount });
    }
  }

  public override render(): JSX.Element {
    const threadDumps = this.props.threadDumps.filter((dump) => dump.threads.length > 0);
    const filters: StuckThreadsFilters = this.state;
    const clusters = getStuckThreadClusters(threadDumps, filters);

    if (threadDumps.length === 0) {
      return <NoThreadDumpsError />;
    }

    return (
      <main id="stuck-threads-page">
        <StuckThreadsSettings
          maxDifferingLines={this.state.maxDifferingLines}
          minClusterSize={this.state.minClusterSize}
          withoutIdle={this.state.withoutIdle}
          nameFilter={this.state.nameFilter}
          stackFilter={this.state.stackFilter}
          onFilterChange={this.handleFilterChange}
          onIntegerChange={this.handleIntegerChange}
          onRegExpChange={this.handleTextChange}
        />

        {this.renderStuckThreads(clusters)}
      </main>
    );
  }

  private renderStuckThreads = (clusters: Thread[][]): React.ReactNode => {
    if (clusters.length === 0) {
      return (
        <EmptyState description="Adjust the filters or clustering settings and try again." />
      );
    }

    return (
      <PaginatedCollection
        items={clusters}
        resetKey={`${this.state.maxDifferingLines}:${this.state.minClusterSize}:${this.state.withoutIdle}:${this.state.nameFilter}:${this.state.stackFilter}:${this.props.threadDumps.length}`}
        getKey={(group) => group[0].uniqueId}
        renderItem={(group) => (
          <StuckThreadsGroup
            threadGroup={group}
            maxDifferingLines={this.state.maxDifferingLines}
          />
        )}
      />
    );
  };
}

export default withThreadDumps(StuckThreadsPage);
