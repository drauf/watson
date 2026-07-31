import React from 'react';
import HoverPopup from '../common/HoverPopup';
import Thread from '../../types/Thread';
import ThreadOverviewRow from './ThreadOverviewRow';

interface Props {
  dates: (string | null)[];
  threadDumps: Map<number, Thread>[];
  matchingStackFilter: Set<number>;
  dumpColumnWidth: number;
  stackPreviewLines: number;
}

export default class ThreadsOverviewTable extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const {
      dates, threadDumps, matchingStackFilter, dumpColumnWidth, stackPreviewLines,
    } = this.props;

    return (
      <div className="threads-overview-table-container">
        <table className={`threads-overview-table${dumpColumnWidth === 0 ? ' threads-overview-table-fit-columns' : ''}`}>
          <colgroup>
            <col className="threads-overview-name-column" />
            {dates.map((date) => (
              <col
                className="threads-overview-dump-column"
                key={date}
                style={dumpColumnWidth === 0 ? undefined : { width: dumpColumnWidth }}
              />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th>Thread Name / Time</th>
              {dates.map((date) => (
                <th key={date}>
                  <HoverPopup content={date || ''}>
                    {date}
                  </HoverPopup>
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
                stackPreviewLines={stackPreviewLines}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
