import React from 'react';
import Monitor from './Monitor';
import MonitorOwner from './MonitorOwner';
import WaitingList from './WaitingList';

type MonitorItemProps = {
  monitor: Monitor;
};

type MonitorItemState = {
  expanded: boolean;
};

export default class MonitorItem extends React.PureComponent<MonitorItemProps, MonitorItemState> {

  public state: MonitorItemState = {
    expanded: false,
  };

  public handleClick = () => {
    this.setState(prevState => ({ expanded: !prevState.expanded }));
  }

  public render() {
    const monitor = this.props.monitor;
    const className = monitor.className
      ? monitor.className.substring(monitor.className.lastIndexOf('.') + 1)
      : 'unknown class';

    return (
      <div className="monitors-container">
        <div className="left">
          <b>{monitor.date ? monitor.date.toLocaleTimeString() : 'unknown timestamp'}</b>
          <br />
          {className}
        </div>
        <div>
          <MonitorOwner monitor={monitor} />
          <WaitingList waiting={monitor.waiting} />
        </div>
      </div>
    );
  }
}
