import React from 'react';
import Thread from '../../types/Thread';
import ThreadDetails from './ThreadDetails';

type Props = {
  maxDifferingLines: number;
  threadGroup: Thread[];
};

// Only show the stack trace if it's the last one or the next one is different than current
const shouldShowStackTrace = (current: Thread, next: Thread | undefined, maxDifferingLines: number): boolean => {
  if (!next) {
    return true;
  }

  const currentStack = current.stackTrace;
  const nextStack = next.stackTrace;
  const limit = Math.min(maxDifferingLines, currentStack.length);

  for (let i = 0; i < limit; i++) {
    if (currentStack[i] !== nextStack[i]) {
      return true;
    }
  }
  return false;
};

const GroupDetails: React.FunctionComponent<Props> = ({ maxDifferingLines, threadGroup }) => (
  <>
    {threadGroup.map((thread, index, array) => (
      <ThreadDetails
        key={thread.uniqueId}
        thread={thread}
        showStackTrace={shouldShowStackTrace(thread, array[index + 1], maxDifferingLines)}
        maxDifferingLines={maxDifferingLines}
      />
    ))}
  </>
);

export default GroupDetails;
