import React from 'react';
import Thread from '../../types/Thread';
import ThreadOverviewRow from './ThreadOverviewRow';
import SmartTooltip from '../common/SmartTooltip';

interface Props {
  dates: (string | null)[];
  threadDumps: Map<number, Thread>[];
  matchingStackFilter: Set<number>;
}

export default class ThreadsOverviewTable extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const { dates, threadDumps, matchingStackFilter } = this.props;

    return (
      <table className="threads-overview-table">
        <thead>
          <tr>
            <th>Thread Name / Time</th>
            {dates.map((date) => (
              <th key={date}>
                <SmartTooltip tooltip={date || ''}>
                  {date}
                </SmartTooltip>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {threadDumps.map((threads) => (
            <ThreadOverviewRow
              key={(threads.values().next().value as Thread).uniqueId}
              total={dates.length}
              threads={threads}
              matchingStackFilter={matchingStackFilter}
            />
          ))}
        </tbody>
      </table>
    );
  }
}
