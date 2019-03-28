import React, { ComponentState } from 'react';
import ReactGA from 'react-ga';
import { getThreadDumps } from '../../App';
import ThreadDump from '../../types/ThreadDump';
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

export default class MonitorsPage extends React.PureComponent<any, State> {

  public state: State = {
    withOwner: false,
    withoutIdle: true,
    withoutOwner: false,
  };

  private threadDumps: ThreadDump[];

  constructor(props: any) {
    super(props);
    this.threadDumps = getThreadDumps();
  }

  public render() {
    if (!this.threadDumps.find(dump => dump.threads.length > 0)) {
      return (
        <h2>To see the Monitors you must upload at least one file with thread dumps.</h2>
      );
    }

    const monitors = this.getMonitorsOverTime(this.threadDumps);
    const filtered = this.filterMonitors(monitors);

    return (
      <div id="monitors-page">
        <MonitorsSettings
          withOwner={this.state.withOwner}
          withoutIdle={this.state.withoutIdle}
          withoutOwner={this.state.withoutOwner}
          onFilterChange={this.handleFilterChange} />

        {filtered.map(monitor => <MonitorOverTimeItem key={monitor.id} monitor={monitor} />)}
      </div>
    );
  }

  private handleFilterChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const name: string = event.target.name;
    const isChecked: boolean = event.target.checked;
    const newState: ComponentState = { [name]: isChecked };

    ReactGA.event({
      action: 'Monitors settings changed',
      category: 'Navigation',
      label: `Filter ${name} changed to ${isChecked}`,
    });
    this.setState(newState);
  }

  private getMonitorsOverTime = (threadDumps: ThreadDump[]): MonitorOverTime[] => {
    const monitorsOverTime: Map<string, MonitorOverTime> = new Map();

    threadDumps.forEach((threadDump) => {
      threadDump.locks.forEach((lock) => {
        const monitor = new Monitor(threadDump.date, lock);

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
    let filtered = monitors;

    if (this.state.withoutIdle) {
      filtered = filtered.filter(monitor => !this.isQueueThread(monitor));
    }
    if (this.state.withOwner) {
      filtered = filtered.filter(monitor => this.hasAnyOwner(monitor));
    }
    if (this.state.withoutOwner) {
      filtered = filtered.filter(monitor => !this.hasAnyOwner(monitor));
    }

    return filtered;
  }

  private hasAnyOwner = (monitorOverTime: MonitorOverTime): boolean => {
    return monitorOverTime.monitors.find(monitor => monitor.owner !== null) !== undefined;
  }

  private isQueueThread = (monitorOverTime: MonitorOverTime): boolean => {
    for (const monitor of monitorOverTime.monitors) {
      // if the lock has an owner, it's not a queue thread
      if (monitor.owner !== null) {
        return false;
      }

      // if the stack trace is too long, it's not a queue thread
      for (const thread of monitor.waiting) {
        if (thread.stackTrace.length > 11) {
          return false;
        }
      }
    }
    return true;
  }
}
