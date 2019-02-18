import React, { ComponentState } from 'react';
import ThreadDumpsUtils from '../../common/ThreadDumpsUtils';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';
import ThreadsOverviewFilteringSummary from './ThreadsOverviewFilteringSummary';
import ThreadsOverviewLegend from './ThreadsOverviewLegend';
import './ThreadsOverviewPage.css';
import ThreadsOverviewSettings from './ThreadsOverviewSettings';
import ThreadsOverviewTable from './ThreadsOverviewTable';

type ThreadsOverviewPageProps = {
  threadDumps: ThreadDump[];
};

type ThreadsOverviewPageState = {
  nameFilter: string;
  stackFilter: string;
};

export default class ThreadsOverviewPage
  extends React.PureComponent<ThreadsOverviewPageProps, ThreadsOverviewPageState> {

  public state = {
    nameFilter: '',
    stackFilter: '',
  };

  public render() {
    if (!this.props.threadDumps.find(dump => dump.threads.length > 0)) {
      return (
        <h2>To see the Threads Overview you must upload at least one file with thread dumps.</h2>
      );
    }

    const threadOverTime = ThreadDumpsUtils.getThreadsOverTime(this.props.threadDumps);
    const filteredDumps = this.filterThreads(threadOverTime);
    const dates = this.props.threadDumps.map(dump => dump.date);

    return (
      <div id="threads-overview-page">
        <ThreadsOverviewSettings
          nameFilter={this.state.nameFilter}
          stackFilter={this.state.stackFilter}
          onSettingsChange={this.handleSettingsChange}
        />
        <ThreadsOverviewFilteringSummary
          isFilteredByStack={this.state.stackFilter.length > 0}
          threadsNumber={threadOverTime.length}
          threadDumps={filteredDumps}
        />
        <ThreadsOverviewLegend />
        <ThreadsOverviewTable
          dates={dates}
          isFilteredByStack={this.state.stackFilter.length > 0}
          threadDumps={filteredDumps}
        />
      </div>
    );
  }

  private handleSettingsChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const newState: ComponentState = { [event.target.name]: event.target.value };
    this.setState(newState);
  }

  private filterThreads = (threadDumps: Array<Map<number, Thread>>) => {
    let filtered = threadDumps;
    filtered = this.filterByName(filtered, this.state.nameFilter);
    this.markMatchingStackFilter(filtered, this.state.stackFilter);
    return filtered;
  }

  private filterByName = (threadDumps: Array<Map<number, Thread>>, nameFilter: string) => {
    if (!nameFilter) {
      return threadDumps;
    }

    let regex: RegExp;
    try {
      regex = new RegExp(nameFilter, 'i');
    } catch {
      return [];
    }

    return threadDumps.filter((threads) => {
      for (const thread of threads) {
        if (regex.test(thread[1].name)) {
          return true;
        }
      }
      return false;
    });
  }

  private markMatchingStackFilter = (threadDumps: Array<Map<number, Thread>>, filter: string) => {
    if (!filter) {
      return threadDumps;
    }

    let regex: RegExp;
    try {
      regex = new RegExp(filter, 'i');
    } catch {
      return;
    }

    threadDumps.forEach((threads) => {
      threads.forEach((thread) => {
        for (const line of thread.stackTrace) {
          if (regex.test(line)) {
            thread.matchingFilter = true;
            return;
          }
        }
        thread.matchingFilter = false;
      });
    });
  }
}
