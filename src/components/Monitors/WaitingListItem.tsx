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
  constructor(props: Props) {
    super(props);
    this.state = { showDetails: false };
  }

  private handleClick = () => {
    this.setState((prevState) => ({ showDetails: !prevState.showDetails }));
  }

  private handleUnload = () => {
    this.setState({ showDetails: false });
  }

  public render() {
    const { thread } = this.props;
    const { showDetails } = this.state;

    return (
      <>
        <button type="button" onClick={this.handleClick}>{thread.name}</button>
        {showDetails && <ThreadDetailsWindow thread={thread} onUnload={this.handleUnload} />}
        <br />
      </>
    );
  }
}
