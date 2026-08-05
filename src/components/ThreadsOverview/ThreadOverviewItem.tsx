import React from 'react';
import HoverPopup from '../common/HoverPopup';
import Thread from '../../types/Thread';
import ThreadStatus from '../../types/ThreadStatus';
import { getThreadStatusAppearance } from '../../common/threadStatusAppearance';

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

const renderStackPopupContent = (thread: Thread, stackPreviewLines: number) => {
  const stackPreview = thread.stackTrace.slice(0, stackPreviewLines);
  const remainingLines = thread.stackTrace.length - stackPreview.length;
  const stackFrameOccurrences = new Map<string, number>();

  return (
    <>
      <dl className="thread-stack-popup-details">
        <dt>Time</dt>
        <dd>{Thread.getFormattedTime(thread)}</dd>
        <dt>Thread</dt>
        <dd>{thread.name}</dd>
      </dl>
      <div className="thread-stack-popup-stack">
        {stackPreview.map((stackFrame) => {
          const occurrence = stackFrameOccurrences.get(stackFrame) || 0;
          stackFrameOccurrences.set(stackFrame, occurrence + 1);

          return (
            <code key={`${stackFrame}-${occurrence}`} title={stackFrame}>
              {stackFrame}
            </code>
          );
        })}
      </div>
      {remainingLines > 0 && (
        <p className="thread-stack-popup-more">
          +
          {remainingLines}
          {' '}
          more stack lines
        </p>
      )}
    </>
  );
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
      <HoverPopup renderContent={() => renderStackPopupContent(thread, stackPreviewLines)}>
        {thread.stackTrace[0]}
      </HoverPopup>
    </div>
  );
};

export default ThreadsOverviewItem;
