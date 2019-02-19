import React from 'react';
import Thread from '../../types/Thread';
import ThreadDetailsWindow from '../ThreadDetails/ThreadDetailsWindow';

type WaitingListItemProps = {
  thread: Thread;
};

type WaitingListItemState = {
  showDetails: boolean;
};

export default class WaitingListItem
  extends React.PureComponent<WaitingListItemProps, WaitingListItemState> {

  public state: WaitingListItemState = {
    showDetails: false,
  };

  public render() {
    const thread = this.props.thread;

    return (
      <>
        <a href="#" onClick={this.handleClick}>{thread.name}</a>
        <br />

        {this.state.showDetails &&
          <ThreadDetailsWindow thread={thread} onUnload={this.handleUnload} />}
      </>
    );
  }

  private handleClick = () => {
    this.setState(prevState => ({ showDetails: !prevState.showDetails }));
  }

  private handleUnload = () => {
    this.setState({ showDetails: false });
  }
}
