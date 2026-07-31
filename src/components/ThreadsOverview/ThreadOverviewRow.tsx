import React, { type JSX } from 'react';
import HoverPopup from '../common/HoverPopup';
import Thread from '../../types/Thread';
import ThreadsOverviewItem from './ThreadOverviewItem';

interface Props {
  total: number;
  threads: Map<number, Thread>;
  matchingStackFilter: Set<number>;
  stackPreviewLines: number;
}

export default class ThreadOverviewRow extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const {
      total, threads, matchingStackFilter, stackPreviewLines,
    } = this.props;

    const threadsPadded: (Thread | undefined)[] = [];
    for (let i = 0; i < total; i++) {
      threadsPadded[i] = threads.get(i);
    }

    const firstThread = threadsPadded.find((thread) => thread !== undefined);
    const threadName = firstThread ? firstThread.name : '';

    return (
      <tr>
        <td className="name">
          <HoverPopup content={threadName}>{threadName}</HoverPopup>
        </td>
        {threadsPadded.map((thread, index) => (
          <ThreadsOverviewItem
            key={thread ? thread.uniqueId : `undefined_${index}`}
            thread={thread}
            isMatchingStackFilter={thread ? matchingStackFilter.has(thread.uniqueId) : false}
            stackPreviewLines={stackPreviewLines}
          />
        ))}
      </tr>
    );
  }
}
