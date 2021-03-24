import React from 'react';
import Thread from '../../types/Thread';
import ThreadDetails from './ThreadDetails';

type Props = {
  maxDifferingLines: number;
  threadGroup: Thread[];
};

export default class GroupDetails extends React.PureComponent<Props> {
  // Only show the stack trace if it's the last one or the next one is different than current
  private static shouldShowStackTrace = (current: Thread, next: Thread | undefined, maxDifferingLines: number): boolean => {
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

  public render(): JSX.Element {
    const { maxDifferingLines, threadGroup } = this.props;

    return (
      <div className="group-details">
        {threadGroup.map((thread, index, array) => (
          <ThreadDetails
            key={thread.uniqueId}
            thread={thread}
            showStackTrace={GroupDetails.shouldShowStackTrace(thread, array[index + 1], maxDifferingLines)}
            maxDifferingLines={maxDifferingLines}
          />
        ))}
      </div>
    );
  }
}
