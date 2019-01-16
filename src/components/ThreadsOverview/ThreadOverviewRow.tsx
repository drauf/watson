import React from 'react';
import Thread from '../../types/Thread';
import ThreadOverviewItem from './ThreadOverviewItem';

type ThreadOverviewRowProps = {
  total: number;
  threads: Map<number, Thread>;
}

const ThreadOverviewRow: React.SFC<ThreadOverviewRowProps> = ({ total, threads }) => {
  const threadsPadded = [];
  for (let i = 0; i < total; i++) {
    threadsPadded[i] = threads.get(i);
  }

  return (
    <tr>
      {threadsPadded.map((thread, i) => <ThreadOverviewItem key={i} thread={thread} />)}
    </tr>
  )
}

export default ThreadOverviewRow;
