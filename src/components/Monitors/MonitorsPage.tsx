import React from 'react';
import ThreadDump from '../../types/ThreadDump';
import Monitor from './Monitor';
import MonitorOverTime from './MonitorOverTime';
import MonitorOverTimeItem from './MonitorOverTimeItem';
import './MonitorsPage.css';

type MonitorsPageProps = {
  threadDumps: ThreadDump[];
};

const getMonitorsOverTime = (threadDumps: ThreadDump[]): MonitorOverTime[] => {
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
};

const MonitorsPage: React.SFC<MonitorsPageProps> = ({ threadDumps }) => {
  if (!threadDumps.find(dump => dump.threads.length > 0)) {
    return (
      <h2>To see the Monitors you must upload at least one file with thread dumps.</h2>
    );
  }

  const monitors = getMonitorsOverTime(threadDumps);

  return (
    <div id="monitors-page">
      {monitors.map((monitor, index) => <MonitorOverTimeItem key={index} monitor={monitor} />)}
    </div>
  );
};

export default MonitorsPage;
