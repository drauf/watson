import React from 'react';
import Thread from '../../types/Thread';
import ThreadOverviewRow from './ThreadOverviewRow';

type Props = {
  dates: Array<string | null>;
  threadDumps: Array<Map<number, Thread>>;
  matchingStackFilter: Set<number>;
};

export default class ThreadsOverview extends React.PureComponent<Props> {
  public render(): JSX.Element {
    const { dates, threadDumps, matchingStackFilter } = this.props;

    return (
      <div id="threads-overview-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Thread Name / Time</th>
              {dates.map((date) => (
                <th key={date}>
                  {date}
                  <span>{date}</span>
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
      </div>
    );
  }
}
