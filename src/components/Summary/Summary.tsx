import * as React from 'react';
import ThreadDump from '../../types/ThreadDump';
import LoadAveragesChart from './LoadAveragesChart';
import MemoryUsageChart from './MemoryUsage';
import SwapUsageChart from './SwapUsageChart';

interface SummaryProps {
  threadDumps: ThreadDump[];
}

const Summary: React.SFC<SummaryProps> = ({ threadDumps }) => (
  <>
    <LoadAveragesChart threadDumps={threadDumps} />
    <p>current CPU usage - user, system, others (?)</p>
    <MemoryUsageChart threadDumps={threadDumps} />
    <SwapUsageChart threadDumps={threadDumps} />
  </>
)

export default Summary;
