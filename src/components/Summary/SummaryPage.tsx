import Page from '../BasePage/Page';
import NoCpuInfosError from '../Errors/NoCpuInfosError';
import LoadAveragesChart from './LoadAveragesChart';
import MemoryUsageChart from './MemoryUsageChart';
import RunningProcessesChart from './RunningProcessesChart';
import './SummaryPage.css';
import SwapUsageChart from './SwapUsageChart';

export default class SummaryPage extends Page {
  public render = (): JSX.Element => {
    if (!this.props.threadDumps.some((dump) => !!dump.loadAverages)) {
      return <NoCpuInfosError />;
    }

    return (
      <main>
        <div id="memory-usages">
          <MemoryUsageChart threadDumps={this.props.threadDumps} />
          <SwapUsageChart threadDumps={this.props.threadDumps} />
        </div>
        <LoadAveragesChart threadDumps={this.props.threadDumps} />
        <RunningProcessesChart threadDumps={this.props.threadDumps} />
      </main>
    );
  }
}
