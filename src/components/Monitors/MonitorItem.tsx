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

    return (
      <>
        <ul className="monitor-item monospaced" onClick={this.handleClick}>
          <li>{monitor.date ? monitor.date.toLocaleTimeString() : 'unknown timestamp'}</li>
          <li>{monitor.waiting.length} thread(s) waiting</li>
          <MonitorOwner monitor={monitor} />
          <li>{monitor.className ? `<${monitor.className}>` : 'unknown class'}</li>
        </ul>

        {this.state.expanded &&
          <WaitingList waiting={monitor.waiting} />}
      </>
    );
  }
}
