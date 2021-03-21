import React from 'react';
import Thread from '../../types/Thread';

type Props = {
  isFilteredByStack: boolean;
  threadsNumber: number;
  threadDumps: Array<Map<number, Thread>>;
};

const matchingCounter = (sum: number, currentThread: Thread): number => sum + (currentThread.matchingFilter ? 1 : 0);
const matchingInGroupCounter = (sum: number, currentGroup: Map<number, Thread>): number => sum + Array.from(currentGroup.values()).reduce(matchingCounter, 0);

const nonEmptyCounter = (sum: number, currentGroup: Map<number, Thread>): number => sum + Array.from(currentGroup.values()).length;

const ThreadsOverviewFilteringSummary: React.FunctionComponent<Props> = ({ isFilteredByStack, threadsNumber, threadDumps }) => {
  if (isFilteredByStack) {
    const matching = threadDumps.reduce(matchingInGroupCounter, 0);
    const total = threadDumps.reduce(nonEmptyCounter, 0);
    const percentage = ((matching / total) * 100).toFixed(1);

    return (
      <p id="matching-summary">
        {matching}
        {' '}
        out of
        {' '}
        {total}
        {' '}
        (
        {percentage}
        %) visible threads matching the stack trace filters
      </p>
    );
  }

  if (threadsNumber !== threadDumps.length) {
    const matching = threadDumps.length;
    const percentage = ((matching / threadsNumber) * 100).toFixed(1);

    return (
      <p id="matching-summary">
        {matching}
        {' '}
        out of
        {' '}
        {threadsNumber}
        {' '}
        (
        {percentage}
        %) threads matching the thread name filters
      </p>
    );
  }

  return <p id="matching-summary" />;
};

export default ThreadsOverviewFilteringSummary;
