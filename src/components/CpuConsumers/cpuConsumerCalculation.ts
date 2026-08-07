import getThreadsOverTime from '../../common/getThreadsOverTime';
import { matchesRegexFilters } from '../../common/regexFiltering';
import { isAnyThreadLabelFilterActive, matchesThreadLabelFilters, ThreadLabelFilters } from '../../common/threadLabelFiltering';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';
import CpuConsumer from './CpuConsumer';
import CpuConsumersMode from './CpuConsumersMode';
import { getCpuUsageSummary } from './cpuUsageSummary';

export interface CpuConsumerFilters extends ThreadLabelFilters {
  nameFilter: string;
  stackFilter: string;
}

const filterThreads = (threads: Map<number, Thread>, filters: CpuConsumerFilters): Map<number, Thread> => {
  if (!filters.nameFilter && !filters.stackFilter && !isAnyThreadLabelFilterActive(filters)) {
    return threads;
  }

  return new Map([...threads].filter(([, thread]) => (
    matchesRegexFilters(thread, filters.nameFilter, filters.stackFilter)
      && matchesThreadLabelFilters(thread, filters)
  )));
};

const calculateUsageFor = (threads: Map<number, Thread>, mode: CpuConsumersMode, dumpCount: number): CpuConsumer => {
  const summary = getCpuUsageSummary(threads.values(), dumpCount);

  switch (mode) {
    case CpuConsumersMode.Mean:
      return new CpuConsumer(summary.mean, summary, threads);
    case CpuConsumersMode.Median:
      return new CpuConsumer(summary.median, summary, threads);
    case CpuConsumersMode.Max:
      return new CpuConsumer(summary.max, summary, threads);
    default:
      throw new Error(`Unsupported calculation mode: ${mode as CpuConsumersMode}`);
  }
};

export const calculateCpuConsumers = (
  threadDumps: ThreadDump[],
  mode: CpuConsumersMode,
  filters: CpuConsumerFilters,
): CpuConsumer[] => getThreadsOverTime(threadDumps)
  .map((threads) => filterThreads(threads, filters))
  .filter((threads) => threads.size > 0)
  .map((threads) => calculateUsageFor(threads, mode, threadDumps.length))
  .sort((first, second) => second.calculatedValue - first.calculatedValue);
