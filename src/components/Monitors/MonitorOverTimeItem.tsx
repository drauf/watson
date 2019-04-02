import React from 'react';
import MonitorItem from './MonitorItem';
import MonitorOverTime from './MonitorOverTime';

type Props = {
  monitor: MonitorOverTime;
};

type State = {
  collapse: boolean;
};

export default class MonitorOverTimeItem extends React.PureComponent<Props, State> {

  public state: State = {
    collapse: false,
  };

  public render() {
    const monitor = this.props.monitor;

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
