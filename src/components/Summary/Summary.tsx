import * as React from 'react';
import ThreadDump from '../../types/ThreadDump';
import CurrentCpuUsageChart from './CurrentCpuUsageChart';
import LoadAveragesChart from './LoadAveragesChart';
import MemoryUsageChart from './MemoryUsage';
import SwapUsageChart from './SwapUsageChart';

interface SummaryProps {
  threadDumps: ThreadDump[];
}

const Summary: React.SFC<SummaryProps> = ({ threadDumps }) => (
  <>
    <LoadAveragesChart threadDumps={threadDumps} />
    <CurrentCpuUsageChart threadDumps={threadDumps} />
    <MemoryUsageChart threadDumps={threadDumps} />
    <SwapUsageChart threadDumps={threadDumps} />
  </>
)

export default Summary;
