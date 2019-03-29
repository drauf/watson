import React from 'react';
import { Props } from '../../common/withThreadDumps';
import LoadAveragesChart from './LoadAveragesChart';
import MemoryUsageChart from './MemoryUsageChart';
import RunningProcessesChart from './RunningProcessesChart';
import './SummaryPage.css';
import SwapUsageChart from './SwapUsageChart';

// tslint:disable-next-line:max-line-length
const MISSING_FILES = 'You need to load the <i>cpu_info</i> files to view the Summary page.';

const SummaryPage: React.SFC<Props> = ({ threadDumps }) => {
  return (
    <div id="summary-page">
      {!threadDumps.find(dump => !!dump.loadAverages)
        ? <h4 dangerouslySetInnerHTML={{ __html: MISSING_FILES }} />
        : <>
          <div id="memory-usages">
            <MemoryUsageChart threadDumps={threadDumps} />
            <SwapUsageChart threadDumps={threadDumps} />
          </div>
          <LoadAveragesChart threadDumps={threadDumps} />
          <RunningProcessesChart threadDumps={threadDumps} />
        </>
      }
    </div>
  );
};

export default SummaryPage;
