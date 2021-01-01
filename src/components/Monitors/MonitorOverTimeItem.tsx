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
  constructor(props: Props) {
    super(props);
    this.state = { collapse: false };
  }

  private toggleCollapse = () => {
    this.setState((prevState) => ({ collapse: !prevState.collapse }));
  }

  public render() {
    const { monitor } = this.props;
    const { collapse } = this.state;

    return (
      <>
        <h5 className="clickable ellipsis" onClick={this.toggleCollapse}>
          <span className={collapse ? 'chevron rotate' : 'chevron'} />
          {monitor.waitingSum}
          {' '}
          thread(s) waiting for &lt;
          {monitor.id}
          &gt;
        </h5>

        {!collapse && monitor.monitors.map((item) => <MonitorItem key={item.time} monitor={item} />)}
      </>
    );
  }
}
