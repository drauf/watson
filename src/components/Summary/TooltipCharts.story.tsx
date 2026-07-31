import type { JSX } from 'react';
import LoadAverages from '../../types/LoadAverage';
import MemoryUnit from '../../types/MemoryUnit';
import MemoryUsage from '../../types/MemoryUsage';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';
import ThreadStatus from '../../types/ThreadStatus';
import LoadAveragesChart from './LoadAveragesChart';
import MemoryUsageChart from './MemoryUsageChart';
import RunningProcessesChart from './RunningProcessesChart';
import './SummaryPage.css';

const createDump = (epoch: number, runningProcesses: number, cpuUsages: string[]): ThreadDump => {
  const dump = new ThreadDump(epoch);
  cpuUsages.forEach((cpuUsage, index) => {
    const thread = new Thread(index + 1, `http-nio-8080-exec-${index + 1}`);
    thread.status = ThreadStatus.RUNNABLE;
    thread.cpuUsage = cpuUsage;
    dump.threads.push(thread);
  });
  dump.runningProcesses = runningProcesses;
  dump.memoryUsage = new MemoryUsage(8192, 6144, 2048, 4096, 1024, 3072, MemoryUnit.MiB);
  dump.loadAverages = new LoadAverages(1.2, 1.5, 1.8);

  return dump;
};

const threadDumps = [
  createDump(Date.UTC(2026, 6, 23, 10, 0, 0), 12, ['18.00', '12.50', '7.25']),
  createDump(Date.UTC(2026, 6, 23, 10, 0, 5), 15, ['22.00', '16.75', '9.50']),
];

const TooltipCharts = (): JSX.Element => (
  <main className="summary-page">
    <RunningProcessesChart threadDumps={threadDumps} />
    <div id="memory-usages">
      <MemoryUsageChart threadDumps={threadDumps} />
    </div>
    <LoadAveragesChart threadDumps={threadDumps} />
  </main>
);

export default TooltipCharts;
