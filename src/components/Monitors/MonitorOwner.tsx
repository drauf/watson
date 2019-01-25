import React from 'react';
import ThreadDetailsWindow from '../ThreadDetails/ThreadDetailsWindow';
import Monitor from './Monitor';

type MonitorOwnerProps = {
  monitor: Monitor;
};

type MonitorOwnerState = {
  showOwner: boolean;
};

export default class MonitorOwner
  extends React.PureComponent<MonitorOwnerProps, MonitorOwnerState> {

  public state: MonitorOwnerState = {
    showOwner: false,
  };

  public handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    this.setState(prevState => ({ showOwner: !prevState.showOwner }));
  }

  public handleUnload = () => {
    this.setState({ showOwner: false });
  }

  public render() {
    const monitor = this.props.monitor;

    return (
      <>
        {monitor.owner
          ? <li className="expandable-details" onClick={this.handleClick}>{monitor.owner.name}</li>
          : <li>no owner</li>}

        {monitor.owner && this.state.showOwner &&
          <ThreadDetailsWindow thread={monitor.owner} onUnload={this.handleUnload} />}
      </>
    );
  }
}
