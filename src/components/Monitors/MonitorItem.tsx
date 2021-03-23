import React from 'react';
import Monitor from './Monitor';
import MonitorOwner from './MonitorOwner';
import WaitingList from './WaitingList';

type Props = {
  monitor: Monitor;
};

export default class MonitorItem extends React.PureComponent<Props> {
  public render(): JSX.Element {
    const { monitor } = this.props;
    const javaClass = monitor.javaClass
      ? monitor.javaClass.substring(monitor.javaClass.lastIndexOf('.') + 1)
      : 'unknown class';

    return (
      <div className="monitors-container">
        <div className="left">
          <h5>{monitor.time}</h5>
          {javaClass}
        </div>
        <div>
          <MonitorOwner monitor={monitor} />
          <WaitingList waiting={monitor.waiting} />
        </div>
      </div>
    );
  }
}
