import React from 'react';
import ThreadDetailsWindow from '../ThreadDetails/ThreadDetailsWindow';
import Monitor from './Monitor';

type Props = {
  monitor: Monitor;
};

type State = {
  showOwner: boolean;
};

export default class MonitorOwner extends React.PureComponent<Props, State> {

  public state: State = {
    showOwner: false,
  };

  public render() {
    const monitor = this.props.monitor;

    if (!monitor.owner) {
      return null;
    }

    return (
      <>
        <b>Held by:</b>
        <br />
        <button className="link" onClick={this.handleClick}>
          {monitor.owner.name}
        </button>
        <br />

        {this.state.showOwner &&
          <ThreadDetailsWindow thread={monitor.owner} onUnload={this.handleUnload} />}
      </>
    );
  }

  private handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    this.setState(prevState => ({ showOwner: !prevState.showOwner }));
  }

  private handleUnload = () => {
    this.setState({ showOwner: false });
  }
}
