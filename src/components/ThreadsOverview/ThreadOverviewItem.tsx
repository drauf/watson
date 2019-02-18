import React from 'react';
import Thread from '../../types/Thread';
import ThreadStatus from '../../types/ThreadStatus';
import ThreadDetailsWindow from '../ThreadDetails/ThreadDetailsWindow';

type ThreadOverviewItemProps = {
  thread?: Thread;
  isFiltered: boolean;
  isMatchingFilter: boolean;
};

type ThreadOverviewItemState = {
  showDetails: boolean;
};

export default class ThreadOverviewItem
  extends React.PureComponent<ThreadOverviewItemProps, ThreadOverviewItemState> {

  public state: ThreadOverviewItemState = {
    showDetails: false,
  };

  public toggleDetails = () => {
    this.setState(prevState => ({ showDetails: !prevState.showDetails }));
  }

  public handleUnload = () => {
    this.setState({ showDetails: false });
  }

  public render() {
    const thread = this.props.thread;

    if (!thread) {
      return <td className="empty" />;
    }

    const className = (this.props.isFiltered)
      ? this.props.isMatchingFilter ? 'matching' : ''
      : thread.status ? thread.status.toString() : ThreadStatus.UNKNOWN.toString();

    return (
      <>
        <td className={className} title={thread.stackTrace[0]} onClick={this.toggleDetails}>
          {thread.stackTrace[0]}
        </td>

        {this.state.showDetails &&
          <ThreadDetailsWindow thread={thread} onUnload={this.handleUnload} />}
      </>
    );
  }
}
