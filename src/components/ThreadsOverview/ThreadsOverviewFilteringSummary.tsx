import React from 'react';
import Thread from '../../types/Thread';

type Props = {
  isFilteredByStack: boolean;
  threadsNumber: number;
  threadDumps: Array<Map<number, Thread>>;
  matchingStackFilter: Set<number>;
};

const nonEmptyCounter = (sum: number, currentGroup: Map<number, Thread>): number => sum + Array.from(currentGroup.values()).length;

export default class ThreadsOverviewFilteringSummary extends React.PureComponent<Props> {
  private static renderFilteredByStackSummary = (threadDumps: Array<Map<number, Thread>>, matchingStackFilter: Set<number>): JSX.Element => {
    const matching = matchingStackFilter.size;
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
  };

  private static renderFilteredByThreadNameSummary = (threadDumps: Array<Map<number, Thread>>, threadsNumber: number): JSX.Element => {
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
  };

  public render(): JSX.Element {
    const {
      isFilteredByStack, threadsNumber, threadDumps, matchingStackFilter,
    } = this.props;

    if (isFilteredByStack) {
      return ThreadsOverviewFilteringSummary.renderFilteredByStackSummary(threadDumps, matchingStackFilter);
    }

    if (threadsNumber !== threadDumps.length) {
      return ThreadsOverviewFilteringSummary.renderFilteredByThreadNameSummary(threadDumps, threadsNumber);
    }

    return <p id="matching-summary" />;
  }
}
