import React from 'react';
import NoCpuInfosError from '../Errors/NoCpuInfosError';
import LoadAveragesChart from './LoadAveragesChart';
import MemoryUsageChart from './MemoryUsageChart';
import RunningProcessesChart from './RunningProcessesChart';
import SwapUsageChart from './SwapUsageChart';
import { useAllThreadDumps } from '../../common/withThreadDumps';

const SummaryPage: React.FC = () => {
  const threadDumps = useAllThreadDumps();

  if (!threadDumps.some((dump) => dump.threads.some((thread) => thread.cpuUsage !== '0.00'))) {
    return <NoCpuInfosError />;
  }

  return (
    <main className="summary-page">
      <RunningProcessesChart threadDumps={threadDumps} />
      <div className="summary-memory-charts">
        <MemoryUsageChart threadDumps={threadDumps} />
        <SwapUsageChart threadDumps={threadDumps} />
      </div>
      <LoadAveragesChart threadDumps={threadDumps} />
    </main>
  );
};

export default SummaryPage;
