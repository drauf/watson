import getThreadsOverTime from '../../common/getThreadsOverTime';
import { isActiveOverTime } from '../../common/threadFilters';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';
import NoThreadDumpsError from '../Errors/NoThreadDumpsError';
import PageWithSettings from '../PageWithSettings';
import ThreadsOverviewFilteringSummary from './ThreadsOverviewFilteringSummary';
import ThreadsOverviewLegend from './ThreadsOverviewLegend';
import './ThreadsOverviewPage.css';
import ThreadsOverviewSettings from './ThreadsOverviewSettings';
import ThreadsOverviewTable from './ThreadsOverviewTable';
import { WithThreadDumpsProps, withThreadDumps } from '../../common/withThreadDumps';

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

class ThreadsOverviewPage extends PageWithSettings<WithThreadDumpsProps, State> {
  public override state = {
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

  private jvmRegex = /^Attach Listener|^C[12] CompilerThread|^G1 Concurrent |^G1 Main|^Gang worker#|^GC Daemon|^Service Thread|^Signal Dispatcher|^String Deduplication Thread|^Surrogate Locker Thread|^VM Periodic|^VM Thread/;

  private tomcatRegex = /^(http|https|ajp)[\w]*-([a-z0-9.]+-)+exec-[0-9]+/;

  private databaseRegex = /^oracle\.jdbc\.driver\.|^org\.postgresql\.|^com\.microsoft\.sqlserver\.|^com\.mysql\.jdbc\./;

  private luceneRegex = /^org\.apache\.lucene\./;

  public override render(): JSX.Element {
    const nonEmptyThreadDumps = this.props.threadDumps.filter((dump) => dump.threads.length > 0);
    const threadOverTime = getThreadsOverTime(nonEmptyThreadDumps);
    const filteredDumps = this.filterThreads(threadOverTime);
    const matchingStackFilter = this.getThreadsMatchingStackFilter(filteredDumps, this.state.stackFilter);
    const dates = nonEmptyThreadDumps.map((dump) => ThreadDump.getFormattedTime(dump));
    const isFilteredByStack = this.isFilteredByStack();

    if (nonEmptyThreadDumps.length === 0) {
      return <NoThreadDumpsError />;
    }

    return (
      <main className="full-width-page">
        <section id="heading">
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
            onRegExpChange={this.handleTextChange}
          />

          <ThreadsOverviewFilteringSummary
            isFilteredByStack={isFilteredByStack}
            threadsNumber={threadOverTime.length}
            threadDumps={filteredDumps}
            matchingStackFilter={matchingStackFilter}
          />

          <ThreadsOverviewLegend />
        </section>

        <ThreadsOverviewTable
          dates={dates}
          threadDumps={filteredDumps}
          matchingStackFilter={matchingStackFilter}
        />
      </main>
    );
  }

  private isFilteredByStack = (): boolean => this.state.stackFilter.length > 0
    || this.state.lucene
    || this.state.database;

  private filterThreads = (threadDumps: Array<Map<number, Thread>>) => {
    let filtered = ThreadsOverviewPage.filterByActive(threadDumps, this.state.active);
    filtered = ThreadsOverviewPage.filterByCpuUsage(filtered, this.state.usingCpu);
    filtered = this.filterByName(filtered, this.state.nameFilter);
    return filtered;
  };

  private static filterByActive = (threadDumps: Array<Map<number, Thread>>, shouldFilter: boolean) => {
    if (!shouldFilter) {
      return threadDumps;
    }

    return threadDumps.filter((threads) => isActiveOverTime(threads));
  };

  private static filterByCpuUsage = (threadDumps: Array<Map<number, Thread>>, shouldFilter: boolean) => {
    if (!shouldFilter) {
      return threadDumps;
    }

    return threadDumps.filter((threads) => ThreadsOverviewPage.isUsingCpu(threads));
  };

  private static isUsingCpu = (threads: Map<number, Thread>): boolean => {
    for (const thread of threads.values()) {
      if (parseFloat(thread.cpuUsage) > 30) {
        return true;
      }
    }

    return false;
  };

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
      .filter((threads) => (this.state.nonJvm ? !ThreadsOverviewPage.matchesName(threads, this.jvmRegex) : true))
      .filter((threads) => (this.state.tomcat ? ThreadsOverviewPage.matchesName(threads, this.tomcatRegex) : true))
      .filter((threads) => (this.state.nonTomcat ? !ThreadsOverviewPage.matchesName(threads, this.tomcatRegex) : true))
      .filter((threads) => (userProvided ? ThreadsOverviewPage.matchesName(threads, userProvided) : true));
  };

  private static matchesName = (threads: Map<number, Thread>, regex: RegExp): boolean => {
    for (const thread of threads.values()) {
      if (regex.test(thread.name)) {
        return true;
      }
    }
    return false;
  };

  private getThreadsMatchingStackFilter = (threadDumps: Array<Map<number, Thread>>, filter: string): Set<number> => {
    const matchingThreadIds = new Set<number>();

    const filters = this.getStackTraceFilters(filter);
    if (filters.length === 0) {
      return matchingThreadIds;
    }

    threadDumps.forEach((threads) => {
      threads.forEach((thread) => ThreadsOverviewPage.addIfMatchesAllFilters(matchingThreadIds, thread, filters));
    });

    return matchingThreadIds;
  };

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
  };

  private static addIfMatchesAllFilters = (matchingThreadIds: Set<number>, thread: Thread, filters: RegExp[]) => {
    for (const filter of filters) {
      if (!ThreadsOverviewPage.matchesStackTraceFilter(thread, filter)) {
        return;
      }
    }
    matchingThreadIds.add(thread.uniqueId);
  };

  private static matchesStackTraceFilter = (thread: Thread, filter: RegExp) => {
    for (const line of thread.stackTrace) {
      if (filter.test(line)) {
        return true;
      }
    }
    return false;
  };
}

export default withThreadDumps(ThreadsOverviewPage);
