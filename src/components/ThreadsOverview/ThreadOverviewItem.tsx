import React from 'react';
import Thread from '../../types/Thread';
import ThreadStatus from '../../types/ThreadStatus';
import ThreadDetails from '../ThreadDetails/ThreadDetails';
import SmartTooltip from '../common/SmartTooltip';

type Props = {
  thread: Thread | undefined;
  isMatchingStackFilter: boolean;
};

export default class ThreadOverviewItem extends React.PureComponent<Props> {
  private static getClassName = (isMatchingStackFilter: boolean, status: ThreadStatus) => {
    const statusClass = status.toString();
    return isMatchingStackFilter ? `${statusClass} matching` : statusClass;
  };

  public override render(): JSX.Element {
    const { thread, isMatchingStackFilter } = this.props;

    if (!thread) {
      return <td className="unknown" aria-label="Unknown thread" />;
    }

    const className = ThreadOverviewItem.getClassName(isMatchingStackFilter, thread.status);

    return (
      <td>
        <SmartTooltip tooltip={thread.stackTrace[0]}>
          <ThreadDetails text={thread.stackTrace[0]} className={className} thread={thread} />
        </SmartTooltip>
      </td>
    );
  }
}
