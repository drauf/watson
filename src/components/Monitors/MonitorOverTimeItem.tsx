import React from 'react';
import MonitorItem from './MonitorItem';
import MonitorOverTime from './MonitorOverTime';

type MonitorOverTimeItemProps = {
  monitor: MonitorOverTime;
};

type MonitorOverTimeItemState = {
  collapse: boolean;
};

export default class MonitorOverTimeItem
  extends React.PureComponent<MonitorOverTimeItemProps, MonitorOverTimeItemState> {

  public state: MonitorOverTimeItemState = {
    collapse: false,
  };

  public render() {
    const monitor = this.props.monitor;

    if (monitor.waitingSum === 0) {
      return null;
    }

    return (
      <>
        <h6 className="clickable" onClick={this.toggleCollapse}>
          <span className={this.state.collapse ? 'chevron rotate' : 'chevron'} />
          {monitor.waitingSum} thread(s) waiting for &lt;{monitor.id}&gt;
        </h6>

        {!this.state.collapse &&
          monitor.monitors.map((item, index) => <MonitorItem key={index} monitor={item} />)}
      </>
    );
  }

  private toggleCollapse = () => {
    this.setState(prevState => ({ collapse: !prevState.collapse }));
  }
}
