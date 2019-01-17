import React from 'react';
import Thread from '../../types/Thread';
import ThreadStatus from '../../types/ThreadStatus';

type ThreadOverviewItemProps = {
  thread?: Thread;
};

const ThreadOverviewItem: React.SFC<ThreadOverviewItemProps> = ({ thread }) => {
  if (!thread) {
    return <td className="empty" />;
  }

  const className = thread.status ? thread.status.toString() : ThreadStatus.UNKNOWN.toString();
  return (
    <td className={className} title={thread.stackTrace[0]}>{thread.stackTrace[0]}</td>
  );
};

export default ThreadOverviewItem;
