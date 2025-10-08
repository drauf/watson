import React from 'react';
import getThreadsOverTime from '../../common/getThreadsOverTime';
import { matchesRegexFilters } from '../../common/regexFiltering';
import { isIdleInSnapshot } from '../../common/threadFilters';
import { WithThreadDumpsProps, withThreadDumps } from '../../common/withThreadDumps';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';
import NoThreadDumpsError from '../Errors/NoThreadDumpsError';
import PageWithSettings from '../PageWithSettings';
import StuckThreadsGroup from './StuckThreadsGroup';
import StuckThreadsSettings from './StuckThreadsSettings';
import './StuckThreadsPage.css';

type State = {
  maxDifferingLines: number;
  minClusterSize: number;
  threadDumps: ThreadDump[];
  withoutIdle: boolean;
  nameFilter: string;
  stackFilter: string;
};

class StuckThreadsPage extends PageWithSettings<WithThreadDumpsProps, State> {
  constructor(props: WithThreadDumpsProps) {
    super(props);

    const nonEmptyThreadDumps = this.props.threadDumps.filter((dump) => dump.threads.length > 0);

    this.state = {
      maxDifferingLines: 5,
      minClusterSize: nonEmptyThreadDumps.length,
      threadDumps: nonEmptyThreadDumps,
      withoutIdle: true,
      nameFilter: '',
      stackFilter: '',
    };
  }

  public override render(): JSX.Element {
    const threadOverTime = getThreadsOverTime(this.state.threadDumps);
    const filtered = this.filterThreads(threadOverTime);
    const clusters = this.buildClusters(filtered);

    if (!this.state.threadDumps.some((dump) => dump.threads.length > 0)) {
      return <NoThreadDumpsError />;
    }

    return (
      <main>
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
      return <h4>{StuckThreadsPage.N0_THREADS_MATCHING}</h4>;
    }

    return clusters.map((group) => (
      <StuckThreadsGroup
        threadGroup={group}
        maxDifferingLines={this.state.maxDifferingLines}
      />
    ));
  };

  private filterThreads = (threadDumps: Array<Map<number, Thread>>): Thread[][] => threadDumps
    .map((threadDump) => this.filterThread(threadDump))
    .filter((dump) => dump.length > 0);

  private filterThread = (threadOverTime: Map<number, Thread>): Thread[] => {
    const filtered = [];

    for (const thread of threadOverTime) {
      if (!this.state.withoutIdle || !isIdleInSnapshot(thread[1])) {
        if (matchesRegexFilters(thread[1], this.state.nameFilter, this.state.stackFilter)) {
          filtered.push(thread[1]);
        }
      }
    }

    return filtered;
  };

  private buildClusters = (threadDumps: Thread[][]): Thread[][] => {
    const clusters: Thread[][] = [];

    for (const threadOverTime of threadDumps) {
      this.getClustersFromThread(threadOverTime)
        .filter((c) => c.length >= this.state.minClusterSize)
        .forEach((c) => clusters.push(c));
    }

    return clusters.sort((c1, c2) => c2.length - c1.length);
  };

  private getClustersFromThread = (threadOverTime: Thread[]): Thread[][] => {
    const clusters = [];

    let currentCluster = [threadOverTime[0]];
    for (let i = 1; i < threadOverTime.length; i++) {
      const previous = threadOverTime[i - 1];
      const current = threadOverTime[i];

      if (this.areThreadsSimilarEnough(previous, current)) {
        currentCluster.push(current);
      } else {
        clusters.push(currentCluster);
        currentCluster = [current];
      }
    }

    clusters.push(currentCluster);
    return clusters;
  };

  private areThreadsSimilarEnough = (t1: Thread, t2: Thread): boolean => {
    const stack1 = t1.stackTrace;
    const stack2 = t2.stackTrace;

    if (Math.abs(stack1.length - stack2.length) > this.state.maxDifferingLines) {
      return false;
    }

    const limit = Math.max(stack1.length, stack2.length);
    for (let i = limit; i >= 0; i--) {
      if (stack1[i] !== stack2[i]) {
        return (i <= this.state.maxDifferingLines);
      }
    }

    return true;
  };
}

export default withThreadDumps(StuckThreadsPage);
