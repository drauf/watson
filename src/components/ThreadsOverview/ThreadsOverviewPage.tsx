import React from 'react';
import getThreadsOverTime from '../../common/getThreadsOverTime';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';
import ThreadStatus from '../../types/ThreadStatus';
import PageWithSettings from '../PageWithSettings/PageWithSettings';
import ThreadsOverviewFilteringSummary from './ThreadsOverviewFilteringSummary';
import ThreadsOverviewLegend from './ThreadsOverviewLegend';
import './ThreadsOverviewPage.css';
import ThreadsOverviewSettings from './ThreadsOverviewSettings';
import ThreadsOverviewTable from './ThreadsOverviewTable';

type State = {
  nonJvm: boolean;
  tomcat: boolean;
  nonTomcat: boolean;
  database: boolean;
  lucene: boolean;
  usingCpu: boolean;
  nameFilter: string;
  stackFilter: string;
};

export default class ThreadsOverviewPage extends PageWithSettings<State> {
  // tslint:disable:object-literal-sort-keys
  public state = {
    active: true,
    nonJvm: true,
    tomcat: false,
    nonTomcat: false,
    database: false,
    lucene: false,
    usingCpu: false,
    nameFilter: '',
    stackFilter: '',
  };
  // tslint:enable:object-literal-sort-keys

  protected PAGE_NAME = 'Threads Overview';

  // tslint:disable:max-line-length
  private jvmRegex = /^Attach Listener|^C[12] CompilerThread|^G1 Concurrent |^G1 Main|^Gang worker#|^GC Daemon|^Service Thread|^Signal Dispatcher|^String Deduplication Thread|^Surrogate Locker Thread|^VM Periodic|^VM Thread/;

  private tomcatRegex = /^http(s-jsse)?-[a-z]io-[0-9]+-exec-[0-9]+/;

  private databaseRegex = /^oracle\.jdbc\.driver\.|^org\.postgresql\.|^com\.microsoft\.sqlserver\.|^com\.mysql\.jdbc\./;

  private luceneRegex = /^org\.apache\.lucene\./;
  // tslint:enable:max-line-length

  public render() {
    const nonEmptyThreadDumps = this.props.threadDumps.filter((dump) => dump.threads.length > 0);
    const threadOverTime = getThreadsOverTime(nonEmptyThreadDumps);
    const filteredDumps = this.filterThreads(threadOverTime);
    const dates = nonEmptyThreadDumps.map((dump) => ThreadDump.getFormattedTime(dump));
    const isFilteredByStack = this.isFilteredByStack();

    return (
      <div id="wide-page">
        <ThreadsOverviewSettings
          active={this.state.active}
          nonJvm={this.state.nonJvm}
          tomcat={this.state.tomcat}
          nonTomcat={this.state.nonTomcat}
          database={this.state.database}
          lucene={this.state.lucene}
          usingCpu={this.state.usingCpu}
          nameFilter={this.state.nameFilter}
          stackFilter={this.state.stackFilter}
          onFilterChange={this.handleFilterChange}
          onRegExpChange={this.handleRegExpChange}
        />

        <ThreadsOverviewFilteringSummary
          isFilteredByStack={isFilteredByStack}
          threadsNumber={threadOverTime.length}
          threadDumps={filteredDumps}
        />

        <ThreadsOverviewLegend />
        {nonEmptyThreadDumps.length === 0
          ? <h4 dangerouslySetInnerHTML={{ __html: ThreadsOverviewPage.NO_THREAD_DUMPS }} />
          : (
            <ThreadsOverviewTable
              dates={dates}
              isFilteredByStack={isFilteredByStack}
              threadDumps={filteredDumps}
            />
          )}
      </div>
    );
  }

  private isFilteredByStack = (): boolean => this.state.stackFilter.length > 0
    || this.state.lucene
    || this.state.database

  private filterThreads = (threadDumps: Array<Map<number, Thread>>) => {
    let filtered = this.filterByActive(threadDumps, this.state.active);
    filtered = this.filterByCpuUsage(filtered, this.state.usingCpu);
    filtered = this.filterByName(filtered, this.state.nameFilter);
    this.markMatchingStackFilter(filtered, this.state.stackFilter);
    return filtered;
  }

  private filterByActive = (threadDumps: Array<Map<number, Thread>>, shouldFilter: boolean) => {
    if (!shouldFilter) {
      return threadDumps;
    }

    return threadDumps.filter((threads) => this.isActive(threads));
  }

  private isActive = (threads: Map<number, Thread>): boolean => {
    let status;
    for (const thread of threads.values()) {
      // Status changed, so the thread is active
      if (status && thread.status !== status) {
        return true;
      }

      // Otherwise the thread is active if it's blocked or runnable and not idle
      status = thread.status;
      if (status === ThreadStatus.BLOCKED
        || (status === ThreadStatus.RUNNABLE && !this.isIdleThread(thread.stackTrace))) {
        return true;
      }
    }

    return false;
  }

  private isIdleThread = (stackTrace: string[]): boolean => {
    if (!stackTrace || !stackTrace[0]) {
      return true;
    }

    // Prevent false positives for threads waiting for IO
    if (stackTrace.length > 16) {
      return false;
    }

    // Filter out the most common queue threads just waiting for some work to do
    if (stackTrace[0] === 'sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)') {
      return true;
    }
    if (stackTrace[0] === 'sun.nio.ch.ServerSocketChannelImpl.accept0(Native Method)') {
      return true;
    }
    if (stackTrace[0] === 'java.net.SocketInputStream.socketRead0(Native Method)') {
      return true;
    }
    if (stackTrace[0] === 'java.net.PlainSocketImpl.socketAccept(Native Method)') {
      return true;
    }

    return false;
  }

  private filterByCpuUsage = (threadDumps: Array<Map<number, Thread>>, shouldFilter: boolean) => {
    if (!shouldFilter) {
      return threadDumps;
    }

    return threadDumps.filter((threads) => this.isUsingCpu(threads));
  }

  private isUsingCpu = (threads: Map<number, Thread>): boolean => {
    for (const thread of threads.values()) {
      if (thread.cpuUsage > 30) {
        return true;
      }
    }

    return false;
  }

  private filterByName = (threadDumps: Array<Map<number, Thread>>, nameFilter: string) => {
    let userProvided: RegExp;
    if (nameFilter) {
      try {
        userProvided = new RegExp(nameFilter, 'i');
      } catch {
        // ignore when user provides invalid RegExp
      }
    }

    return threadDumps
      .filter((threads) => (this.state.nonJvm ? !this.matchesName(threads, this.jvmRegex) : true))
      .filter((threads) => (this.state.tomcat ? this.matchesName(threads, this.tomcatRegex) : true))
      .filter((threads) => (this.state.nonTomcat ? !this.matchesName(threads, this.tomcatRegex) : true))
      .filter((threads) => (userProvided ? this.matchesName(threads, userProvided) : true));
  }

  private matchesName = (threads: Map<number, Thread>, regex: RegExp): boolean => {
    for (const thread of threads.values()) {
      if (regex.test(thread.name)) {
        return true;
      }
    }
    return false;
  }

  private markMatchingStackFilter = (threadDumps: Array<Map<number, Thread>>, filter: string) => {
    this.clearAllMatches(threadDumps);

    const filters = this.getStackTraceFilters(filter);
    if (filters.length === 0) {
      return;
    }

    threadDumps.forEach((threads) => {
      threads.forEach((thread) => this.markIfMatchesAllFilters(thread, filters));
    });
  }

  private clearAllMatches = (threadDumps: Array<Map<number, Thread>>) => {
    threadDumps.forEach((threads) => {
      threads.forEach((thread) => {
        thread.matchingFilter = false;
      });
    });
  }

  private getStackTraceFilters = (userProvidedFilter: string): RegExp[] => {
    const filters: RegExp[] = [];

    if (userProvidedFilter) {
      try {
        const userProvided = new RegExp(userProvidedFilter, 'i');
        filters.push(userProvided);
      } catch {
        // ignore when user provides invalid RegExp
      }
    }

    if (this.state.lucene) {
      filters.push(this.luceneRegex);
    }
    if (this.state.database) {
      filters.push(this.databaseRegex);
    }

    return filters;
  }

  private markIfMatchesAllFilters = (thread: Thread, filters: RegExp[]) => {
    for (const filter of filters) {
      if (!this.matchesStackTraceFilter(thread, filter)) {
        return;
      }
    }
    thread.matchingFilter = true;
  }

  private matchesStackTraceFilter = (thread: Thread, filter: RegExp) => {
    for (const line of thread.stackTrace) {
      if (filter.test(line)) {
        return true;
      }
    }
    return false;
  }
}
