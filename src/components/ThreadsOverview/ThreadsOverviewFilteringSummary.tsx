import Inline from '@atlaskit/primitives/inline';
import Text from '@atlaskit/primitives/text';
import React, { type JSX } from 'react';
import { ThreadOverviewDataRow } from './threadsOverviewRows';

interface Props {
  isFilteredByStack: boolean;
  threadsNumber: number;
  rows: ThreadOverviewDataRow[];
  matchingStackFilter: Set<number>;
}

const nonEmptyCounter = (sum: number, row: ThreadOverviewDataRow): number => sum + row.threadsByDump.size;

export default class ThreadsOverviewFilteringSummary extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const {
      isFilteredByStack, threadsNumber, rows, matchingStackFilter,
    } = this.props;
    const matchingThreads = rows.length;
    const matchingSnapshots = matchingStackFilter.size;
    const totalSnapshots = rows.reduce(nonEmptyCounter, 0);
    const matchingSnapshotPercentage = totalSnapshots === 0
      ? '0.0'
      : ((matchingSnapshots / totalSnapshots) * 100).toFixed(1);
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
            {matchingSnapshotPercentage}
            %)
          </Text>
        )}
      </Inline>
    );
  }
}
