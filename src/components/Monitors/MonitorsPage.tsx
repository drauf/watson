import React, { type JSX } from 'react';
import EmptyState from '../Errors/EmptyState';
import { filterMonitors, MonitorFilters } from './monitorFiltering';
import ThreadDump from '../../types/ThreadDump';
import NoThreadDumpsError from '../Errors/NoThreadDumpsError';
import PageWithSettings from '../PageWithSettings';
import PaginatedCollection from '../common/PaginatedCollection';
import Monitor from './Monitor';
import MonitorOverTime from './MonitorOverTime';
import MonitorOverTimeGroup from './MonitorOverTimeItem';
import './MonitorsPage.css';
import MonitorsSettings from './MonitorsSettings';
import { WithThreadDumpsProps, withThreadDumps } from '../../common/withThreadDumps';

interface State {
  withOwner: boolean;
  withoutIdle: boolean;
  withoutOwner: boolean;
  nameFilter: string;
  stackFilter: string;
}

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
    const filters: MonitorFilters = this.state;
    const filtered = filterMonitors(monitors, filters);

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

        {this.renderMonitors(filtered)}
      </main>
    );
  }

  private renderMonitors = (filtered: MonitorOverTime[]): React.ReactNode => {
    if (filtered.length === 0) {
      return (
        <EmptyState title={MonitorsPage.N0_MONITORS_MATCHING} />
      );
    }
    return (
      <PaginatedCollection
        items={filtered}
        resetKey={`${this.state.withOwner}:${this.state.withoutIdle}:${this.state.withoutOwner}:${this.state.nameFilter}:${this.state.stackFilter}:${this.props.threadDumps.length}`}
        getKey={(monitor) => monitor.uniqueId}
        renderItem={(monitor) => <MonitorOverTimeGroup monitor={monitor} />}
      />
    );
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
}

export default withThreadDumps(MonitorsPage);
