import React from 'react';
import Thread from '../../types/Thread';
import ThreadOverviewRow from './ThreadOverviewRow';

type Props = {
  dates: Array<string | null>;
  isFilteredByStack: boolean;
  threadDumps: Array<Map<number, Thread>>;
};

export default class ThreadsOverview extends React.PureComponent<Props> {
  public render(): JSX.Element {
    const { dates, isFilteredByStack, threadDumps } = this.props;

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
                isFiltered={isFilteredByStack}
                total={dates.length}
                threads={threads}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
