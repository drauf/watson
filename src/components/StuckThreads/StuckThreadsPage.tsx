import React from 'react';
import getThreadsOverTime from '../../common/getThreadsOverTime';
import isIdleThread from '../../common/isIdleThread';
import { WithThreadDumpsProps } from '../../common/withThreadDumps';
import Thread from '../../types/Thread';
import PageWithSettings from '../PageWithSettings/PageWithSettings';
import StuckThreadsGroup from './StuckThreadsGroup';
import StuckThreadsSettings from './StuckThreadsSettings';

type State = {
  maxDifferingLines: number;
  minClusterSize: number;
  withoutIdle: boolean;
};

export default class StuckThreadsPage extends PageWithSettings<State> {
  protected PAGE_NAME = 'Stuck Threads';

  constructor(props: WithThreadDumpsProps) {
    super(props);

    this.state = {
      maxDifferingLines: 5,
      minClusterSize: this.props.threadDumps.length,
      withoutIdle: true,
    };
  }

  public render() {
    const threadOverTime = getThreadsOverTime(this.props.threadDumps);
    const filtered = this.filterThreads(threadOverTime);
    const clusters = this.buildClusters(filtered);

    return (
      <div id="page">
        <StuckThreadsSettings
          maxDifferingLines={this.state.maxDifferingLines}
          minClusterSize={this.state.minClusterSize}
          withoutIdle={this.state.withoutIdle}
          onFilterChange={this.handleFilterChange}
          onIntegerChange={this.handleIntegerChange} />

        {!this.props.threadDumps.some(dump => dump.threads.length > 0)
          ? <h4 dangerouslySetInnerHTML={{ __html: StuckThreadsPage.NO_THREAD_DUMPS }} />
          : clusters.length === 0
            ? <h4>{StuckThreadsPage.N0_THREADS_MATCHING}</h4>
            : clusters.map((group, index) => (
              <StuckThreadsGroup key={index}
                threadGroup={group}
                maxDifferingLines={this.state.maxDifferingLines} />))}
      </div>
    );
  }

  private filterThreads = (threadDumps: Array<Map<number, Thread>>): Thread[][] => {
    return threadDumps
      .map(threadDump => this.filterThread(threadDump))
      .filter(dump => dump.length > 0);
  }

  private filterThread = (threadOverTime: Map<number, Thread>): Thread[] => {
    const filtered = [];

    for (const thread of threadOverTime) {
      if (this.state.withoutIdle && isIdleThread(thread[1])) {
        continue;
      }

      filtered.push(thread[1]);
    }

    return filtered;
  }

  private buildClusters = (threadDumps: Thread[][]): Thread[][] => {
    const clusters: Thread[][] = [];

    for (const threadOverTime of threadDumps) {
      this.getClustersFromThread(threadOverTime)
        .filter(c => c.length >= this.state.minClusterSize)
        .forEach(c => clusters.push(c));
    }

    return clusters.sort((c1, c2) => c2.length - c1.length);
  }

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
  }

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
  }
}