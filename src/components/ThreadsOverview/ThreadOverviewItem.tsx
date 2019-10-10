import React from 'react';
import Thread from '../../types/Thread';
import ThreadStatus from '../../types/ThreadStatus';
import ThreadDetailsWindow from '../ThreadDetails/ThreadDetailsWindow';

type Props = {
  thread?: Thread;
  isFiltered: boolean;
  isMatchingFilter: boolean;
};

type State = {
  showDetails: boolean;
};

export default class ThreadOverviewItem extends React.PureComponent<Props, State> {

  public state: State = {
    showDetails: false,
  };

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
        <td className={className} onClick={this.toggleDetails}>
          {thread.stackTrace[0]}
          <span>{thread.stackTrace[0]}</span>
        </td>

        {this.state.showDetails &&
          <ThreadDetailsWindow thread={thread} onUnload={this.handleUnload} />}
      </>
    );
  }

  private toggleDetails = () => {
    this.setState(prevState => ({ showDetails: !prevState.showDetails }));
  }

  private handleUnload = () => {
    this.setState({ showDetails: false });
  }
}
