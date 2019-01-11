import * as React from 'react';
import ThreadDump from '../../types/ThreadDump';
import LoadAveragesChart from './LoadAveragesChart';

interface SummaryProps {
  threadDumps: ThreadDump[];
}

const Summary: React.SFC<SummaryProps> = ({ threadDumps }) => (
  <>
    <LoadAveragesChart threadDumps={threadDumps} />
    <p>memory usage</p>
    <p>in the future: current CPU usage - user, system (others?)</p>
  </>
)

export default Summary;
