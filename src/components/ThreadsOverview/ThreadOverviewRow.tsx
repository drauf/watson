import React from 'react';
import Thread from '../../types/Thread';
import ThreadOverviewItem from './ThreadOverviewItem';

type Props = {
  total: number;
  threads: Map<number, Thread>;
  isFiltered: boolean;
};

const ThreadOverviewRow: React.SFC<Props> = ({ total, threads, isFiltered }) => {
  const threadsPadded: Array<Thread | undefined> = [];
  for (let i = 0; i < total; i++) {
    threadsPadded[i] = threads.get(i);
  }

  const firstThread = threadsPadded.find(thread => thread !== undefined);
  const threadName = firstThread ? firstThread.name : '';

  return (
    <tr>
      <td className="name">
        {threadName}
        <span>{threadName}</span>
      </td>
      {threadsPadded.map((thread, i) => (
        <ThreadOverviewItem key={i}
          thread={thread}
          isFiltered={isFiltered}
          isMatchingFilter={thread ? thread.matchingFilter : false}
        />
      ))}
    </tr>
  );
};

export default ThreadOverviewRow;
