import React from 'react';
import ThreadDump from '../../types/ThreadDump';
import Monitor from './Monitor';
import MonitorOverTime from './MonitorOverTime';
import MonitorOverTimeItem from './MonitorOverTimeItem';
import './MonitorsPage.css';
import MonitorsSettings from './MonitorsSettings';

export enum MonitorsFilter {
  None,
  WithOwner,
  WithoutOwner,
}

type MonitorsPageProps = {
  threadDumps: ThreadDump[];
};

type MonitorsPageState = {
  filter: MonitorsFilter;
};

export default class MonitorsPage
  extends React.PureComponent<MonitorsPageProps, MonitorsPageState> {

  public state: MonitorsPageState = {
    filter: MonitorsFilter.None,
  };

  public render() {
    if (!this.props.threadDumps.find(dump => dump.threads.length > 0)) {
      return (
        <h2>To see the Monitors you must upload at least one file with thread dumps.</h2>
      );
    }

    const monitors = this.getMonitorsOverTime(this.props.threadDumps);
    const filtered = this.filterMonitors(monitors);

    return (
      <div id="monitors-page">
        <MonitorsSettings filter={this.state.filter} onFilterChange={this.changeFilter} />
        {filtered.map((monitor, index) => <MonitorOverTimeItem key={index} monitor={monitor} />)}
      </div>
    );
  }

  private changeFilter = (filter: number): React.MouseEventHandler<HTMLAnchorElement> => () => {
    this.setState({ filter: filter as MonitorsFilter });
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
    switch (this.state.filter) {
      case MonitorsFilter.WithOwner:
        return monitors.filter(monitor => this.hasAnyOwner(monitor));
      case MonitorsFilter.WithoutOwner:
        return monitors.filter(monitor => !this.hasAnyOwner(monitor));
      case MonitorsFilter.None:
      default:
        return monitors;
    }
  }

  private hasAnyOwner = (monitorOverTime: MonitorOverTime): boolean => {
    return monitorOverTime.monitors.find(monitor => monitor.owner !== null) !== undefined;
  }
}
