import * as React from 'react';
import ThreadDumpsUtils from '../../common/ThreadDumpsUtils';
import ThreadDump from '../../types/ThreadDump';
import ThreadOverviewRow from './ThreadOverviewRow';

interface ThreadsOverviewProps {
  threadDumps: ThreadDump[];
}

const ThreadsOverview: React.SFC<ThreadsOverviewProps> = ({ threadDumps }) => {
  const threadOverTime = Array.from(ThreadDumpsUtils.getThreadsOverTime(threadDumps).values());

  return (
    <div className="threads-overview-table">
      <table>
        <thead>
          <tr>
            {threadDumps.map((threadDump, index) => (
              <th key={index}>{threadDump.date ? threadDump.date.toLocaleTimeString() : null}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {threadOverTime.map((threads, index) => (
            <ThreadOverviewRow key={index} total={threadDumps.length} threads={threads} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ThreadsOverview;
