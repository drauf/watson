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
  constructor(props: Props) {
    super(props);
    this.state = { showOwner: false };
  }

  private handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    this.setState((prevState) => ({ showOwner: !prevState.showOwner }));
  }

  private handleUnload = () => {
    this.setState({ showOwner: false });
  }

  public render() {
    const { monitor } = this.props;

    if (!monitor.owner) {
      return null;
    }

    const { showOwner } = this.state;
    return (
      <>
        <b>Held by:</b>
        <br />
        <button type="button" onClick={this.handleClick}>
          {monitor.owner.name}
        </button>
        <br />

        {showOwner && <ThreadDetailsWindow thread={monitor.owner} onUnload={this.handleUnload} />}
      </>
    );
  }
}
