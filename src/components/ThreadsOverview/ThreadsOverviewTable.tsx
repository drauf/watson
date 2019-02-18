import React from 'react';
import Thread from '../../types/Thread';
import ThreadOverviewRow from './ThreadOverviewRow';

type ThreadsOverviewProps = {
  dates: Array<Date | null>;
  isFilteredByStack: boolean;
  threadDumps: Array<Map<number, Thread>>;
};

const ThreadsOverview: React.SFC<ThreadsOverviewProps>
  = ({ dates, isFilteredByStack, threadDumps }) => (
    <table className="threads-overview-table">
      <thead>
        <tr>
          <th />
          {dates.map((date, index) => (
            <th key={index}>{date ? date.toLocaleTimeString() : null}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {threadDumps.map((threads, index) => (
          <ThreadOverviewRow key={index}
            isFiltered={isFilteredByStack}
            total={dates.length}
            threads={threads}
          />
        ))}
      </tbody>
    </table>
  );

export default ThreadsOverview;
