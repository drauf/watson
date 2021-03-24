import React from 'react';
import Thread from '../../types/Thread';
import ThreadStatus from '../../types/ThreadStatus';
import ThreadDetailsWindow from '../ThreadDetails/ThreadDetailsWindow';

type Props = {
  thread?: Thread;
  isMatchingStackFilter: boolean;
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
  };

  private handleUnload = () => {
    this.setState({ showDetails: false });
  };

  private getClassName = (isMatchingStackFilter: boolean, status: ThreadStatus) => {
    const statusClass = status.toString();
    return isMatchingStackFilter ? `${statusClass} matching` : statusClass;
  };

  public render(): JSX.Element {
    const { showDetails } = this.state;
    const { thread, isMatchingStackFilter } = this.props;

    if (!thread) {
      return <td className="unknown" />;
    }

    const className = this.getClassName(isMatchingStackFilter, thread.status);

    return (
      <>
        <td className={className} onClick={this.toggleDetails}>
          {thread.stackTrace[0]}
          {thread.stackTrace[0] && <span>{thread.stackTrace[0]}</span>}
        </td>

        {showDetails && <ThreadDetailsWindow thread={thread} onUnload={this.handleUnload} />}
      </>
    );
  }
}
