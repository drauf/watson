import React from 'react';
import NoCpuInfosError from '../Errors/NoCpuInfosError';
import LoadAveragesChart from './LoadAveragesChart';
import MemoryUsageChart from './MemoryUsageChart';
import RunningProcessesChart from './RunningProcessesChart';
import './SummaryPage.css';
import SwapUsageChart from './SwapUsageChart';
import { useThreadDumps } from '../../common/withThreadDumps';

const SummaryPage: React.FC = () => {
  const threadDumps = useThreadDumps();

  if (!threadDumps.some((dump) => dump.threads.some((thread) => thread.cpuUsage > 0))) {
    return <NoCpuInfosError />;
  }

  return (
    <main>
      <RunningProcessesChart threadDumps={threadDumps} />
      <div id="memory-usages">
        <MemoryUsageChart threadDumps={threadDumps} />
        <SwapUsageChart threadDumps={threadDumps} />
      </div>
      <LoadAveragesChart threadDumps={threadDumps} />
    </main>
  );
};

export default SummaryPage;
