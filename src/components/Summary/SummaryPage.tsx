import React from 'react';
import PageWithSettings from '../PageWithSettings/PageWithSettings';
import LoadAveragesChart from './LoadAveragesChart';
import MemoryUsageChart from './MemoryUsageChart';
import RunningProcessesChart from './RunningProcessesChart';
import './SummaryPage.css';
import SwapUsageChart from './SwapUsageChart';

export default class SummaryPage extends PageWithSettings<any> {
  public render = () => (
    <div id="wide-page">
      {!this.props.threadDumps.some(dump => !!dump.loadAverages)
        ? <h4 dangerouslySetInnerHTML={{ __html: SummaryPage.NO_CPU_INFOS }} />
        : <>
          <RunningProcessesChart threadDumps={this.props.threadDumps} />
          <div id="memory-usages">
            <MemoryUsageChart threadDumps={this.props.threadDumps} />
            <SwapUsageChart threadDumps={this.props.threadDumps} />
          </div>
          <LoadAveragesChart threadDumps={this.props.threadDumps} />
        </>
      }
    </div>
  )
}
