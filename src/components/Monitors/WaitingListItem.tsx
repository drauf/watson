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

  public handleClick = () => {
    this.setState(prevState => ({ showDetails: !prevState.showDetails }));
  }

  public handleUnload = () => {
    this.setState({ showDetails: false });
  }

  public render() {
    const thread = this.props.thread;

    return (
      <>
        <li className="expandable-details" onClick={this.handleClick}>{thread.name}</li>

        {this.state.showDetails &&
          <ThreadDetailsWindow thread={thread} onUnload={this.handleUnload} />}
      </>
    );
  }
}
