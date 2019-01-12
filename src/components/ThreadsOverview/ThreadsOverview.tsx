import * as React from 'react';
import ThreadDumpsUtils from '../../common/ThreadDumpsUtils';
import ThreadDump from '../../types/ThreadDump';
import './ThreadsOverview.css';
import ThreadsOverviewLegend from './ThreadsOverviewLegend';
import ThreadsOverviewTable from './ThreadsOverviewTable';

interface ThreadsOverviewProps {
  threadDumps: ThreadDump[];
}

const ThreadsOverview: React.SFC<ThreadsOverviewProps> = ({ threadDumps }) => {
  return (
    <div className="threads-overview-content">
      <ThreadsOverviewLegend />
      <ThreadsOverviewTable threadDumps={threadDumps} />
    </div>
  )
}

export default ThreadsOverview;
