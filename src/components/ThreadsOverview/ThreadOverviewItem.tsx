import React from 'react';
import Thread from '../../types/Thread';
import ThreadStatus from '../../types/ThreadStatus';
import ThreadDetails from '../ThreadDetails/ThreadDetails';

type Props = {
  thread: Thread | undefined;
  isMatchingStackFilter: boolean;
};

export default class ThreadOverviewItem extends React.PureComponent<Props> {
  private static getClassName = (isMatchingStackFilter: boolean, status: ThreadStatus) => {
    const statusClass = status.toString();
    return isMatchingStackFilter ? `${statusClass} matching` : statusClass;
  };

  public render(): JSX.Element {
    const { thread, isMatchingStackFilter } = this.props;

    if (!thread) {
      return <td className="unknown" />;
    }

    const className = ThreadOverviewItem.getClassName(isMatchingStackFilter, thread.status);

    return (
      <td>
        <ThreadDetails text={thread.stackTrace[0]} className={className} thread={thread} />
      </td>
    );
  }
}
