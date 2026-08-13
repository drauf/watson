import Thread from '../../types/Thread';
import ThreadStatus from '../../types/ThreadStatus';

export const MAXIMUM_TOOLTIP_THREADS = 10;

export interface RunningProcessesTooltipData {
  readonly runningProcesses: number;
  readonly threadNames: readonly string[];
}

const getRunningProcesses = (value: unknown): number => {
  const runningProcesses = Number(value);
  return Number.isFinite(runningProcesses) ? runningProcesses : 0;
};

// The tooltip only renders the top N threads, so avoid sorting every candidate
const insertIntoTopThreads = (topThreads: readonly Thread[], thread: Thread): Thread[] => {
  const insertAt = topThreads.findIndex((candidate) => parseFloat(candidate.cpuUsage) < parseFloat(thread.cpuUsage));
  const index = insertAt === -1 ? topThreads.length : insertAt;

  return [
    ...topThreads.slice(0, index),
    thread,
    ...topThreads.slice(index),
  ].slice(0, MAXIMUM_TOOLTIP_THREADS);
};

export const getRunningProcessesTooltipData = (
  runningProcessesValue: unknown,
  threadsValue: unknown,
): RunningProcessesTooltipData => {
  const threads = Array.isArray(threadsValue) ? threadsValue as Thread[] : [];

  return {
    runningProcesses: getRunningProcesses(runningProcessesValue),
    threadNames: threads
      .reduce<Thread[]>((topThreads, thread) => {
        if (thread.status !== ThreadStatus.RUNNABLE || thread.cpuUsage === '0.00') {
          return topThreads;
        }

        return insertIntoTopThreads(topThreads, thread);
      }, [])
      .map((thread) => `${thread.cpuUsage}% CPU - ${thread.name}`),
  };
};
