import React from 'react';
import { WithThreadDumpsProps } from '../../common/withThreadDumps';
import NoCpuInfosError from '../Errors/NoCpuInfosError';
import LoadAveragesChart from './LoadAveragesChart';
import MemoryUsageChart from './MemoryUsageChart';
import RunningProcessesChart from './RunningProcessesChart';
import './SummaryPage.css';
import SwapUsageChart from './SwapUsageChart';

export default class SummaryPage extends React.PureComponent<WithThreadDumpsProps> {
  public render = (): JSX.Element => {
    const { threadDumps } = this.props;

    if (!threadDumps.some((dump) => !!dump.loadAverages)) {
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
}
