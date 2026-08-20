import type { JSX } from 'react';
import Thread from '../../types/Thread';
import StackTrace from '../common/StackTrace';
import './ThreadStackPopupContent.css';

interface Props {
  stackPreviewLines: number;
  thread: Thread;
}

const ThreadStackPopupContent = ({ stackPreviewLines, thread }: Props): JSX.Element => {
  const stackPreview = thread.stackTrace.slice(0, stackPreviewLines);
  const remainingLines = thread.stackTrace.length - stackPreview.length;

  const remainingLineLabel = remainingLines === 1 ? 'line' : 'lines';

  return (
    <div className="thread-stack-popup">
      <dl>
        <dt>Time</dt>
        <dd>{Thread.getFormattedTime(thread)}</dd>
        <dt>Thread</dt>
        <dd>{thread.name}</dd>
      </dl>
      <hr />
      <StackTrace stackTrace={stackPreview} linesToConsider={0} />
      {remainingLines > 0 && (
        <p className="thread-stack-popup-more">
          +
          {remainingLines}
          {' '}
          more stack
          {' '}
          {remainingLineLabel}
        </p>
      )}
    </div>
  );
};

export default ThreadStackPopupContent;
