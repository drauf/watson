import React from 'react';
import ThreadDump from '../../types/ThreadDump';
import NoThreadDumpsError from '../Errors/NoThreadDumpsError';
import PageWithSettings from '../PageWithSettings';
import Monitor from './Monitor';
import MonitorOverTime from './MonitorOverTime';
import MonitorOverTimeGroup from './MonitorOverTimeItem';
import './MonitorsPage.css';
import MonitorsSettings from './MonitorsSettings';
import { WithThreadDumpsProps } from '../../common/withThreadDumps';

type State = {
  withOwner: boolean;
  withoutIdle: boolean;
  withoutOwner: boolean;
};

export default class MonitorsPage extends PageWithSettings<WithThreadDumpsProps, State> {
  public state: State = {
    withOwner: false,
    withoutIdle: true,
    withoutOwner: false,
  };

  public render(): JSX.Element {
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
          onFilterChange={this.handleFilterChange}
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

    return filtered;
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
