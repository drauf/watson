import React from 'react';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';
import NoThreadDumpsError from '../Errors/NoThreadDumpsError';
import PageWithSettings from '../PageWithSettings';
import Monitor from './Monitor';
import MonitorOverTime from './MonitorOverTime';
import MonitorOverTimeGroup from './MonitorOverTimeItem';
import './MonitorsPage.css';
import MonitorsSettings from './MonitorsSettings';
import { WithThreadDumpsProps, withThreadDumps } from '../../common/withThreadDumps';

type State = {
  withOwner: boolean;
  withoutIdle: boolean;
  withoutOwner: boolean;
  nameFilter: string;
  stackFilter: string;
};

class MonitorsPage extends PageWithSettings<WithThreadDumpsProps, State> {
  public override state: State = {
    withOwner: false,
    withoutIdle: true,
    withoutOwner: false,
    nameFilter: '',
    stackFilter: '',
  };

  public override render(): JSX.Element {
    const monitors = MonitorsPage.getMonitorsOverTime(this.props.threadDumps);
    const filtered = this.filterMonitors(monitors);

    if (!this.props.threadDumps.some((dump) => dump.threads.length > 0)) {
      return <NoThreadDumpsError />;
    }

    return (
      <main>
        <MonitorsSettings
          withOwner={this.state.withOwner}
          withoutIdle={this.state.withoutIdle}
          withoutOwner={this.state.withoutOwner}
          nameFilter={this.state.nameFilter}
          stackFilter={this.state.stackFilter}
          onFilterChange={this.handleFilterChange}
          onRegExpChange={this.handleTextChange}
        />

        {MonitorsPage.renderMonitors(filtered)}
      </main>
    );
  }

  private static renderMonitors = (filtered: MonitorOverTime[]): React.ReactNode => {
    if (filtered.length === 0) {
      return <h4>{MonitorsPage.N0_MONITORS_MATCHING}</h4>;
    }
    return filtered.map((monitor) => <MonitorOverTimeGroup key={monitor.uniqueId} monitor={monitor} />);
  };

  private static getMonitorsOverTime = (threadDumps: ThreadDump[]): MonitorOverTime[] => {
    const monitorsOverTime = new Map<string, MonitorOverTime>();

    threadDumps.forEach((threadDump) => {
      threadDump.locks.forEach((lock) => {
        const monitor = new Monitor(threadDump, lock);

        let monitorOverTime = monitorsOverTime.get(lock.id);
        if (!monitorOverTime) {
          // hide unnecessary noise from the page
          if (monitor.waiting.length === 1 && monitor.waiting[0] === monitor.owner) {
            return;
          }

          monitorOverTime = new MonitorOverTime(lock.id);
          monitorsOverTime.set(lock.id, monitorOverTime);
        }

        monitorOverTime.monitors.push(monitor);
        monitorOverTime.waitingSum += monitor.waiting.length;
      });
    });

    return Array
      .from(monitorsOverTime.values())
      .sort((m1, m2) => m2.waitingSum - m1.waitingSum);
  };

  private filterMonitors = (monitors: MonitorOverTime[]) => {
    let filtered = monitors.filter((monitor) => monitor.waitingSum > 0);

    if (this.state.withoutIdle) {
      filtered = filtered.filter((monitor) => !MonitorsPage.isQueueThread(monitor));
    }
    if (this.state.withOwner) {
      filtered = filtered.filter((monitor) => MonitorsPage.hasAnyOwner(monitor));
    }
    if (this.state.withoutOwner) {
      filtered = filtered.filter((monitor) => !MonitorsPage.hasAnyOwner(monitor));
    }
    if (this.state.nameFilter || this.state.stackFilter) {
      filtered = filtered.filter((monitor) => this.matchesRegexpFilters(monitor));
    }

    return filtered;
  };

  private matchesRegexpFilters = (monitorOverTime: MonitorOverTime): boolean => {
    for (const monitor of monitorOverTime.monitors) {
      const allThreads = [...monitor.waiting];
      if (monitor.owner) {
        allThreads.push(monitor.owner);
      }

      for (const thread of allThreads) {
        if (this.matchesThreadFilters(thread)) {
          return true;
        }
      }
    }
    return false;
  };

  private matchesThreadFilters = (thread: Thread): boolean => {
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
      return thread.stackTrace.some((line: string) => regex.test(line));
    } catch {
      return true; // ignore invalid regex
    }
  };

  private static hasAnyOwner = (monitorOverTime: MonitorOverTime): boolean => monitorOverTime.monitors.some((monitor) => !!monitor.owner);

  private static isQueueThread = (monitorOverTime: MonitorOverTime): boolean => {
    for (const monitor of monitorOverTime.monitors) {
      // if the lock has an owner, it's not a queue thread
      if (monitor.owner) {
        return false;
      }

      // if the stack trace is too long, it's not a queue thread
      for (const thread of monitor.waiting) {
        if (thread.stackTrace.length > 12) {
          return false;
        }
      }
    }
    return true;
  };
}

export default withThreadDumps(MonitorsPage);
