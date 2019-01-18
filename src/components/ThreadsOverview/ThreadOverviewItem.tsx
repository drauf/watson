import React from 'react';
import Thread from '../../types/Thread';
import ThreadStatus from '../../types/ThreadStatus';
import ThreadDetails from '../ThreadDetails/ThreadDetails';

type ThreadOverviewItemProps = {
  thread?: Thread;
  filtered: boolean;
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

  public render() {
    const thread = this.props.thread;

    if (!thread) {
      return <td className="empty" />;
    }

    const className = (this.props.filtered)
      ? thread.matchingFilter ? 'matching' : ''
      : thread.status ? thread.status.toString() : ThreadStatus.UNKNOWN.toString();

    return (
      <>
        {this.state.showDetails && <ThreadDetails thread={thread} />}
        <td className={className} title={thread.stackTrace[0]} onClick={this.toggleDetails}>
          {thread.stackTrace[0]}
        </td>
      </>
    );
  }
}
