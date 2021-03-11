import React from 'react';
import ThreadDump from '../../types/ThreadDump';
import PageWithSettings from '../BasePage/PageWithSettings';
import Monitor from './Monitor';
import MonitorOverTime from './MonitorOverTime';
import MonitorOverTimeItem from './MonitorOverTimeItem';
import './MonitorsPage.css';
import MonitorsSettings from './MonitorsSettings';

type State = {
  withOwner: boolean;
  withoutIdle: boolean;
  withoutOwner: boolean;
};

export default class MonitorsPage extends PageWithSettings<State> {
  public state: State = {
    withOwner: false,
    withoutIdle: true,
    withoutOwner: false,
  };

  protected PAGE_NAME = 'Monitors';

  public render(): JSX.Element {
    const monitors = this.getMonitorsOverTime(this.props.threadDumps);
    const filtered = this.filterMonitors(monitors);

    return (
      <div id="page">
        <MonitorsSettings
          withOwner={this.state.withOwner}
          withoutIdle={this.state.withoutIdle}
          withoutOwner={this.state.withoutOwner}
          onFilterChange={this.handleFilterChange}
        />

        {!this.props.threadDumps.some((dump) => dump.threads.length > 0)
          ? <h4 dangerouslySetInnerHTML={{ __html: MonitorsPage.NO_THREAD_DUMPS }} />
          : this.renderMonitors(filtered)}
      </div>
    );
  }

  private renderMonitors = (filtered: MonitorOverTime[]): React.ReactNode => {
    if (filtered.length === 0) {
      return <h4>{MonitorsPage.N0_MONITORS_MATCHING}</h4>;
    }
    return filtered.map((monitor) => <MonitorOverTimeItem key={monitor.id} monitor={monitor} />);
  }

  private getMonitorsOverTime = (threadDumps: ThreadDump[]): MonitorOverTime[] => {
    const monitorsOverTime: Map<string, MonitorOverTime> = new Map();

    threadDumps.forEach((threadDump) => {
      threadDump.locks.forEach((lock) => {
        const monitor = new Monitor(threadDump, lock);

        let monitorOverTime = monitorsOverTime.get(lock.id);
        if (!monitorOverTime) {
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
  }

  private filterMonitors = (monitors: MonitorOverTime[]) => {
    let filtered = monitors.filter((monitor) => monitor.waitingSum > 0);

    if (this.state.withoutIdle) {
      filtered = filtered.filter((monitor) => !this.isQueueThread(monitor));
    }
    if (this.state.withOwner) {
      filtered = filtered.filter((monitor) => this.hasAnyOwner(monitor));
    }
    if (this.state.withoutOwner) {
      filtered = filtered.filter((monitor) => !this.hasAnyOwner(monitor));
    }

    return filtered;
  }

  private hasAnyOwner = (monitorOverTime: MonitorOverTime): boolean => monitorOverTime.monitors.some((monitor) => monitor.owner !== null)

  private isQueueThread = (monitorOverTime: MonitorOverTime): boolean => {
    for (const monitor of monitorOverTime.monitors) {
      // if the lock has an owner, it's not a queue thread
      if (monitor.owner !== null) {
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
  }
}
