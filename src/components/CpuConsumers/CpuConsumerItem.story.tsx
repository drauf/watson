import type { JSX } from 'react';
import { ThreadLabel } from '../../common/threadLabels';
import Thread from '../../types/Thread';
import ThreadStatus from '../../types/ThreadStatus';
import CpuConsumer from './CpuConsumer';
import CpuConsumerItem from './CpuConsumerItem';

const createThread = (id: number, usage: string): Thread => {
  const thread = new Thread(id, 'http-nio-8080-exec-42');
  thread.cpuUsage = usage;
  thread.status = ThreadStatus.RUNNABLE;
  thread.labels = [ThreadLabel.HTTP, ThreadLabel.INDEX_SEARCH, ThreadLabel.CPU_ACTIVE];
  return thread;
};

const consumer = new CpuConsumer(
  52.5,
  { mean: 12.5, median: 52.5, max: 85 },
  new Map([
    [0, createThread(1, '12.50')],
    [2, createThread(3, '52.50')],
    [3, createThread(4, '85.00')],
  ]),
);

export const MissingDumpAndThresholds = (): JSX.Element => (
  <CpuConsumerItem consumer={consumer} dumpsNumber={4} />
);

export default MissingDumpAndThresholds;
