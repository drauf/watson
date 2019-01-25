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
  const monitors = getMonitorsOverTime(threadDumps);

  return (
    <div className="monitors-content">
      {monitors.map((monitor, index) => <MonitorOverTimeItem key={index} monitor={monitor} />)}
    </div>
  );
};

export default MonitorsPage;
