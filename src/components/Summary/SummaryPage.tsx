import React from 'react';
import { getThreadDumps } from '../threadDumps';
import LoadAveragesChart from './LoadAveragesChart';
import MemoryUsageChart from './MemoryUsageChart';
import RunningProcessesChart from './RunningProcessesChart';
import './SummaryPage.css';
import SwapUsageChart from './SwapUsageChart';

const SummaryPage: React.SFC = () => {
  const threadDumps = getThreadDumps();

  if (!threadDumps.find(dump => !!dump.loadAverages)) {
    return (
      <h2>To see the Summary you must upload at least one cpu_info file.</h2>
    );
  }

  return (
    <div id="summary-page">
      <div id="memory-usages">
        <MemoryUsageChart threadDumps={threadDumps} />
        <SwapUsageChart threadDumps={threadDumps} />
      </div>
      <LoadAveragesChart threadDumps={threadDumps} />
      <RunningProcessesChart threadDumps={threadDumps} />
    </div>
  );
};

export default SummaryPage;
