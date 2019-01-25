import React from 'react';
import MonitorItem from './MonitorItem';
import MonitorOverTime from './MonitorOverTime';

type MonitorOverTimeItemProps = {
  monitor: MonitorOverTime;
};

type MonitorOverTimeItemState = {
  expanded: boolean;
};

export default class MonitorOverTimeItem
  extends React.PureComponent<MonitorOverTimeItemProps, MonitorOverTimeItemState> {

  public state: MonitorOverTimeItemState = {
    expanded: false,
  };

  public handleClick = () => {
    this.setState(prevState => ({ expanded: !prevState.expanded }));
  }

  public render() {
    const monitor = this.props.monitor;

    return (
      <>
        <h6 className="monitor-over-time-item" onClick={this.handleClick}>
          {monitor.waitingSum} thread(s) waiting for &lt;{monitor.id}&gt;
        </h6>

        {this.state.expanded &&
          monitor.monitors.map((item, index) => <MonitorItem key={index} monitor={item} />)}
      </>
    );
  }
}
