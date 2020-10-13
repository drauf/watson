import React from 'react';
import Thread from '../../types/Thread';
import ThreadDetailsWindow from '../ThreadDetails/ThreadDetailsWindow';

type Props = {
  thread: Thread;
};

type State = {
  showDetails: boolean;
};

export default class WaitingListItem extends React.PureComponent<Props, State> {
  public state: State = {
    showDetails: false,
  };

  public render() {
    const { thread } = this.props;

    return (
      <>
        <button onClick={this.handleClick}>{thread.name}</button>
        {this.state.showDetails
          && <ThreadDetailsWindow thread={thread} onUnload={this.handleUnload} />}

        <br />
      </>
    );
  }

  private handleClick = () => {
    this.setState((prevState) => ({ showDetails: !prevState.showDetails }));
  }

  private handleUnload = () => {
    this.setState({ showDetails: false });
  }
}
