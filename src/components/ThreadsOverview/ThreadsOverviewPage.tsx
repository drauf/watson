import React, { ComponentState } from 'react';
import ReactGA from 'react-ga';
import getThreadsOverTime from '../../common/ThreadDumpsUtils';
import { Props } from '../../common/withThreadDumps';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';
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
  nameFilter: string;
  stackFilter: string;
};

export default class ThreadsOverviewPage extends React.PureComponent<Props, State> {
  // tslint:disable-next-line:max-line-length
  private static NO_THREAD_DUMPS = 'You need to load the <i>thread_dump</i> files to see this data.';

  // tslint:disable:object-literal-sort-keys
  public state = {
    nonJvm: true,
    tomcat: false,
    nonTomcat: false,
    database: false,
    lucene: false,
    nameFilter: '',
    stackFilter: '',
  };
  // tslint:enable:object-literal-sort-keys

  // tslint:disable:max-line-length
  private jvmRegex = /^Attach Listener|^C[12] CompilerThread|^G1 Concurrent |^G1 Main|^Gang worker#|^GC Daemon|^Service Thread|^Signal Dispatcher|^String Deduplication Thread|^Surrogate Locker Thread|^VM Periodic|^VM Thread/;
  private tomcatRegex = /^http(s\-jsse)?\-[a-z]io\-[0-9]+\-exec\-[0-9]+/;
  private databaseRegex = /^oracle\.jdbc\.driver\.|^org\.postgresql\.|^com\.microsoft\.sqlserver\.|^com\.mysql\.jdbc\./;
  private luceneRegex = /^org\.apache\.lucene\./;
  // tslint:enable:max-line-length

  public render() {
    const threadOverTime = getThreadsOverTime(this.props.threadDumps);
    const filteredDumps = this.filterThreads(threadOverTime);
    const dates = this.props.threadDumps.map(dump => ThreadDump.getFormattedTime(dump));
    const isFilteredByStack = this.isFilteredByStack();

    return (
      <div id="threads-overview-page">
        <ThreadsOverviewSettings
          nonJvm={this.state.nonJvm}
          tomcat={this.state.tomcat}
          nonTomcat={this.state.nonTomcat}
          database={this.state.database}
          lucene={this.state.lucene}
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
        {!this.props.threadDumps.find(dump => dump.threads.length > 0)
          ? <h4 dangerouslySetInnerHTML={{ __html: ThreadsOverviewPage.NO_THREAD_DUMPS }} />
          : <ThreadsOverviewTable
            dates={dates}
            isFilteredByStack={isFilteredByStack}
            threadDumps={filteredDumps}
          />
        }
      </div>
    );
  }

  private handleFilterChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const name: string = event.target.name;
    const isChecked: boolean = event.target.checked;
    const newState: ComponentState = { [name]: isChecked };

    ReactGA.event({
      action: 'Threads Overview settings changed',
      category: 'Navigation',
      label: `Filter ${name} changed to ${isChecked}`,
    });
    this.setState(newState);
  }

  private handleRegExpChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const name: string = event.target.name;
    const value: string = event.target.value;
    const newState: ComponentState = { [name]: value };

    ReactGA.event({
      action: 'Threads Overview settings changed',
      category: 'Navigation',
      label: `RegExp ${name} changed to ${value}`,
    });
    this.setState(newState);
  }

  private isFilteredByStack = (): boolean => {
    return this.state.stackFilter.length > 0
      || this.state.lucene
      || this.state.database;
  }

  private filterThreads = (threadDumps: Array<Map<number, Thread>>) => {
    let filtered = threadDumps;
    filtered = this.filterByName(filtered, this.state.nameFilter);
    this.markMatchingStackFilter(filtered, this.state.stackFilter);
    return filtered;
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
      .filter(threads => this.state.nonJvm ? !this.matchesName(threads, this.jvmRegex) : true)
      .filter(threads => this.state.tomcat ? this.matchesName(threads, this.tomcatRegex) : true)
      .filter(threads => this.state.nonTomcat ? !this.matchesName(threads, this.tomcatRegex) : true)
      .filter(threads => userProvided ? this.matchesName(threads, userProvided) : true);
  }

  private matchesName(threads: Map<number, Thread>, regex: RegExp): boolean {
    for (const thread of threads) {
      if (regex.test(thread[1].name)) {
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
      threads.forEach(thread => this.markIfMatchesAllFilters(thread, filters));
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
