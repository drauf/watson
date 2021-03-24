import React from 'react';
import Thread from '../../types/Thread';
import ThreadOverviewItem from './ThreadOverviewItem';

type Props = {
  total: number;
  threads: Map<number, Thread>;
  isFiltered: boolean;
};

export default class ThreadOverviewRow extends React.PureComponent<Props> {
  public render(): JSX.Element {
    const { total, threads, isFiltered } = this.props;

    const threadsPadded: Array<Thread | undefined> = [];
    for (let i = 0; i < total; i++) {
      threadsPadded[i] = threads.get(i);
    }

    const firstThread = threadsPadded.find((thread) => thread !== undefined);
    const threadName = firstThread ? firstThread.name : '';

    return (
      <tr>
        <td className="name">
          {threadName}
          <span>{threadName}</span>
        </td>
        {threadsPadded.map((thread, index) => (
          <ThreadOverviewItem
            key={thread ? thread.uniqueId : `undefined_${index}`}
            thread={thread}
            isFiltered={isFiltered}
            isMatchingFilter={thread ? thread.matchingFilter : false}
          />
        ))}
      </tr>
    );
  }
}
