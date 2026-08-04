import React, { type JSX } from 'react';
import HoverPopup from '../common/HoverPopup';
import Thread from '../../types/Thread';
import ThreadsOverviewItem from './ThreadOverviewItem';
import { ThreadOverviewDataRow } from './threadsOverviewRows';

interface Props {
  total: number;
  row: ThreadOverviewDataRow;
  matchingStackFilter: Set<number>;
  stackPreviewLines: number;
  onOpenThreadDetails: (thread: Thread) => void;
}

export default class ThreadOverviewRow extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const {
      total, row, matchingStackFilter, stackPreviewLines, onOpenThreadDetails,
    } = this.props;

    return (
      <tr>
        <td className="name">
          <HoverPopup content={row.name}>{row.name}</HoverPopup>
        </td>
        {Array.from({ length: total }, (_, dumpIndex) => {
          const thread = row.threadsByDump.get(dumpIndex);
          return (
            <ThreadsOverviewItem
              key={thread ? thread.uniqueId : `undefined_${dumpIndex}`}
              thread={thread}
              isMatchingStackFilter={thread ? matchingStackFilter.has(thread.uniqueId) : false}
              stackPreviewLines={stackPreviewLines}
              onOpenThreadDetails={onOpenThreadDetails}
            />
          );
        })}
      </tr>
    );
  }
}
