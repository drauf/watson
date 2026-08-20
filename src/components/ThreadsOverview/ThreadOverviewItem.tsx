import React from 'react';
import HoverPopup from '../common/HoverPopup';
import Thread from '../../types/Thread';
import ThreadStatus from '../../types/ThreadStatus';
import { getThreadStatusAppearance } from '../../common/threadStatusAppearance';
import ThreadStackPopupContent from './ThreadStackPopupContent';
import './ThreadsOverviewStatus.css';

interface Props {
  thread: Thread | undefined;
  isMatchingStackFilter: boolean;
  stackPreviewLines: number;
  onOpenThreadDetails: (thread: Thread) => void;
  rowIndex: number;
  columnIndex: number;
  style: React.CSSProperties;
}

const getClassName = (isMatchingStackFilter: boolean, status: ThreadStatus) => {
  const appearance = getThreadStatusAppearance(status);
  return `threads-overview-status-${appearance}${isMatchingStackFilter ? ' threads-overview-status-matching' : ''}`;
};

const openThreadDetailsOnKeyDown = (
  event: React.KeyboardEvent<HTMLDivElement>,
  thread: Thread,
  onOpenThreadDetails: (threadToOpen: Thread) => void,
): void => {
  if (event.key !== 'Enter' && event.key !== ' ') return;

  event.preventDefault();
  onOpenThreadDetails(thread);
};

const ThreadsOverviewItem: React.FC<Props> = ({
  thread,
  isMatchingStackFilter,
  stackPreviewLines,
  onOpenThreadDetails,
  rowIndex,
  columnIndex,
  style,
}) => {
  if (!thread) {
    return (
      <div
        className="threads-overview-grid-cell unknown"
        role="gridcell"
        aria-rowindex={rowIndex}
        aria-colindex={columnIndex}
        aria-label="Unknown thread"
        style={style}
      />
    );
  }

  const className = getClassName(isMatchingStackFilter, thread.status);

  return (
    <div
      className={`threads-overview-grid-cell ${className}`}
      role="gridcell"
      aria-rowindex={rowIndex}
      aria-colindex={columnIndex}
      tabIndex={0}
      onClick={() => onOpenThreadDetails(thread)}
      onKeyDown={(event) => openThreadDetailsOnKeyDown(event, thread, onOpenThreadDetails)}
      style={style}
    >
      <HoverPopup renderContent={() => <ThreadStackPopupContent stackPreviewLines={stackPreviewLines} thread={thread} />}>
        {thread.stackTrace[0]}
      </HoverPopup>
    </div>
  );
};

export default ThreadsOverviewItem;
