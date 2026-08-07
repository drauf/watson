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
export default class ThreadsOverviewFilteringSummary extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const {
      isFilteredByStack, threadsNumber, rows, matchingStackFilter,
    } = this.props;
    const matchingThreads = rows.length;
    const matchingSnapshots = matchingStackFilter.size;
    const isFilteredByRows = threadsNumber !== matchingThreads;

    if (!isFilteredByRows && !isFilteredByStack) {
      return <Text id="matching-summary">{null}</Text>;
    }

    return (
      <Inline id="matching-summary" alignBlock="center" space="space.100" shouldWrap>
        {isFilteredByRows && (
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
        {isFilteredByRows && isFilteredByStack && <Text as="span" color="color.text.subtle">·</Text>}
        {isFilteredByStack && (
          <Text as="span">
            Highlighting
            {' '}
            {matchingSnapshots}
            {' '}
            matching thread snapshots
          </Text>
        )}
      </Inline>
    );
  }
}
