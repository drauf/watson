import React from 'react';
import Thread from '../../types/Thread';
import ThreadStatus from '../../types/ThreadStatus';

interface ThreadOverviewItemProps {
  thread: Thread | undefined;
}

const ThreadOverviewItem: React.SFC<ThreadOverviewItemProps> = ({ thread }) => {
  if (!thread) {
    return <td className="empty" />
  }

  const className = thread.status ? thread.status.toString() : ThreadStatus.UNKNOWN.toString();
  return (
    <td className={className}>{thread.name}</td>
  )
}

export default ThreadOverviewItem;
