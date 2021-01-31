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
  constructor(props: Props) {
    super(props);
    this.state = { showDetails: false };
  }

  private toggleDetails = () => {
    this.setState((prevState) => ({ showDetails: !prevState.showDetails }));
  }

  private handleUnload = () => {
    this.setState({ showDetails: false });
  }

  private getClassName = (isFiltered: boolean, isMatchingFilter: boolean, status: ThreadStatus | undefined) => {
    const statusClass = status ? status.toString() : '';
    return isFiltered && isMatchingFilter ? `${statusClass} matching` : statusClass;
  }

  public render() {
    const { showDetails } = this.state;
    const { thread, isFiltered, isMatchingFilter } = this.props;

    if (!thread) {
      return <td className="empty" />;
    }

    const className = this.getClassName(isFiltered, isMatchingFilter, thread.status);

    return (
      <>
        <td className={className} onClick={this.toggleDetails}>
          {thread.stackTrace[0]}
          <span>{thread.stackTrace[0]}</span>
        </td>

        {showDetails && <ThreadDetailsWindow thread={thread} onUnload={this.handleUnload} />}
      </>
    );
  }
}
