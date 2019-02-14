import React from 'react';
import ThreadDump from '../../types/ThreadDump';
import CurrentCpuUsageChart from './CurrentCpuUsageChart';
import LoadAveragesChart from './LoadAveragesChart';
import MemoryUsageChart from './MemoryUsageChart';
import './SummaryPage.css';
import SwapUsageChart from './SwapUsageChart';

type SummaryPageProps = {
  threadDumps: ThreadDump[];
};

const SummaryPage: React.SFC<SummaryPageProps> = ({ threadDumps }) => {
  if (!threadDumps.find(dump => !!dump.loadAverages)) {
    return (
      <h2>To see the Summary you must upload at least one cpu_info file.</h2>
    );
  }

  return (
    <div id="summary-page">
      <LoadAveragesChart threadDumps={threadDumps} />
      <MemoryUsageChart threadDumps={threadDumps} />
      <SwapUsageChart threadDumps={threadDumps} />
      <CurrentCpuUsageChart threadDumps={threadDumps} />
    </div>
  );
};

export default SummaryPage;
