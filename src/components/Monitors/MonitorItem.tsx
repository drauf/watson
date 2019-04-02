import React from 'react';
import Monitor from './Monitor';
import MonitorOwner from './MonitorOwner';
import WaitingList from './WaitingList';

type Props = {
  monitor: Monitor;
};

const MonitorItem: React.SFC<Props> = ({ monitor }) => {
  const javaClass = monitor.javaClass
    ? monitor.javaClass.substring(monitor.javaClass.lastIndexOf('.') + 1)
    : 'unknown class';

  return (
    <div className="monitors-container">
      <div className="left">
        <b>{monitor.time}</b>
        <br />
        {javaClass}
      </div>
      <div>
        <MonitorOwner monitor={monitor} />
        <WaitingList waiting={monitor.waiting} />
      </div>
    </div>
  );
};

export default MonitorItem;
