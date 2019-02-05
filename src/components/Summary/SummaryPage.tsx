import React from 'react';
import ThreadDump from '../../types/ThreadDump';
import CurrentCpuUsageChart from './CurrentCpuUsageChart';
import LoadAveragesChart from './LoadAveragesChart';
import MemoryUsageChart from './MemoryUsageChart';
import SwapUsageChart from './SwapUsageChart';

type SummaryPageProps = {
  threadDumps: ThreadDump[];
};

const SummaryPage: React.SFC<SummaryPageProps> = ({ threadDumps }) => {
  if (!threadDumps.find(dump => !!dump.loadAverages)) {
    return (
      <div className="content">
        <h2>To see the Summary you must upload at least one cpu_info file.</h2>
      </div>
    );
  }

  return (
    <div className="content">
      <LoadAveragesChart threadDumps={threadDumps} />
      <MemoryUsageChart threadDumps={threadDumps} />
      <SwapUsageChart threadDumps={threadDumps} />
      <CurrentCpuUsageChart threadDumps={threadDumps} />
    </div>
  );
};

export default SummaryPage;
