import Inline from '@atlaskit/primitives/inline';
import Text from '@atlaskit/primitives/text';
import React from 'react';
import Thread from '../../types/Thread';

interface Props {
  isFilteredByStack: boolean;
  threadsNumber: number;
  threadDumps: Map<number, Thread>[];
  matchingStackFilter: Set<number>;
}

const nonEmptyCounter = (sum: number, currentGroup: Map<number, Thread>): number => sum + Array.from(currentGroup.values()).length;

export default class ThreadsOverviewFilteringSummary extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const {
      isFilteredByStack, threadsNumber, threadDumps, matchingStackFilter,
    } = this.props;
    const matchingThreads = threadDumps.length;
    const matchingSnapshots = matchingStackFilter.size;
    const totalSnapshots = threadDumps.reduce(nonEmptyCounter, 0);
    const isFilteredByName = threadsNumber !== matchingThreads;

    if (!isFilteredByName && !isFilteredByStack) {
      return <Text id="matching-summary">{null}</Text>;
    }

    return (
      <Inline id="matching-summary" alignBlock="center" space="space.100" shouldWrap>
        {isFilteredByName && (
          <Text as="span">
            Showing
            {' '}
            {matchingThreads}
            {' '}
            of
            {' '}
            {threadsNumber}
            {' '}
            threads (
            {((matchingThreads / threadsNumber) * 100).toFixed(1)}
            %)
          </Text>
        )}
        {isFilteredByName && isFilteredByStack && <Text as="span" color="color.text.subtle">·</Text>}
        {isFilteredByStack && (
          <Text as="span">
            Highlighting
            {' '}
            {matchingSnapshots}
            {' '}
            of
            {' '}
            {totalSnapshots}
            {' '}
            thread snapshots (
            {((matchingSnapshots / totalSnapshots) * 100).toFixed(1)}
            %)
          </Text>
        )}
      </Inline>
    );
  }
}
