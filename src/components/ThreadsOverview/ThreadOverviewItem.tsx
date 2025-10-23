import React from 'react';
import Thread from '../../types/Thread';
import ThreadStatus from '../../types/ThreadStatus';
import SmartTooltip from '../common/SmartTooltip';
import useOpenThreadDetails from '../ThreadDetails/useOpenThreadDetails';

type Props = {
  thread: Thread | undefined;
  isMatchingStackFilter: boolean;
};

const getClassName = (isMatchingStackFilter: boolean, status: ThreadStatus) => {
  const statusClass = status.toString();
  return isMatchingStackFilter ? `${statusClass}-matching` : statusClass;
};

const ThreadsOverviewItem: React.FC<Props> = ({ thread, isMatchingStackFilter }) => {
  const { open, WindowComponent } = useOpenThreadDetails(thread);
  if (!thread) {
    return <td className="unknown" aria-label="Unknown thread" />;
  }

  const className = getClassName(isMatchingStackFilter, thread.status);

  return (
    <>
      <td className={className} onClick={open}>
        <SmartTooltip tooltip={thread.stackTrace[0]}>
          {thread.stackTrace[0]}
        </SmartTooltip>
      </td>
      {WindowComponent}
    </>
  );
};

export default ThreadsOverviewItem;
