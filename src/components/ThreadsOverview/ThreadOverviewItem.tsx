import React from 'react';
import HoverPopup from '../common/HoverPopup';
import Thread from '../../types/Thread';
import ThreadStatus from '../../types/ThreadStatus';
import useOpenThreadDetails from '../ThreadDetails/useOpenThreadDetails';

interface Props {
  thread: Thread | undefined;
  isMatchingStackFilter: boolean;
  stackPreviewLines: number;
}

const getClassName = (isMatchingStackFilter: boolean, status: ThreadStatus) => {
  const statusClass = status.toString();
  return isMatchingStackFilter ? `${statusClass}-matching` : statusClass;
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

const ThreadsOverviewItem: React.FC<Props> = ({
  thread,
  isMatchingStackFilter,
  stackPreviewLines,
}) => {
  const { open, WindowComponent } = useOpenThreadDetails(thread);
  if (!thread) {
    return <td className="unknown" aria-label="Unknown thread" />;
  }

  const className = getClassName(isMatchingStackFilter, thread.status);

  return (
    <>
      <td className={className} onClick={open}>
        <HoverPopup content={renderStackPopupContent(thread, stackPreviewLines)}>
          {thread.stackTrace[0]}
        </HoverPopup>
      </td>
      {WindowComponent}
    </>
  );
};

export default ThreadsOverviewItem;
