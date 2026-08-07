import getThreadsOverTime from '../../common/getThreadsOverTime';
import { matchesRegexFilters } from '../../common/regexFiltering';
import { isIdleInSnapshot } from '../../common/threadFilters';
import { matchesThreadLabelFilters, ThreadLabelFilters } from '../../common/threadLabelFiltering';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';

export interface StuckThreadsFilters extends ThreadLabelFilters {
  maxDifferingLines: number;
  minClusterSize: number;
  withoutIdle: boolean;
  nameFilter: string;
  stackFilter: string;
}

const areThreadsSimilarEnough = (first: Thread, second: Thread, maxDifferingLines: number): boolean => {
  const firstStack = first.stackTrace;
  const secondStack = second.stackTrace;

  if (Math.abs(firstStack.length - secondStack.length) > maxDifferingLines) {
    return false;
  }

  for (let index = Math.max(firstStack.length, secondStack.length); index >= 0; index -= 1) {
    if (firstStack[index] !== secondStack[index]) {
      return index <= maxDifferingLines;
    }
  }

  return true;
};

const clusterThreadSnapshots = (threadOverTime: Thread[], maxDifferingLines: number): Thread[][] => {
  if (threadOverTime.length === 0) {
    return [];
  }

  const clusters: Thread[][] = [];
  let currentCluster = [threadOverTime[0]];

  for (let index = 1; index < threadOverTime.length; index += 1) {
    const previous = threadOverTime[index - 1];
    const current = threadOverTime[index];

    if (areThreadsSimilarEnough(previous, current, maxDifferingLines)) {
      currentCluster.push(current);
    } else {
      clusters.push(currentCluster);
      currentCluster = [current];
    }
  }

  clusters.push(currentCluster);
  return clusters;
};

export const getStuckThreadClusters = (
  threadDumps: ThreadDump[],
  filters: StuckThreadsFilters,
): Thread[][] => getThreadsOverTime(threadDumps.filter((dump) => dump.threads.length > 0))
  .map((threads) => Array.from(threads.values()).filter((thread) => (
    (!filters.withoutIdle || !isIdleInSnapshot(thread))
      && matchesRegexFilters(thread, filters.nameFilter, filters.stackFilter)
      && matchesThreadLabelFilters(thread, filters)
  )))
  .filter((threads) => threads.length > 0)
  .flatMap((threads) => clusterThreadSnapshots(threads, filters.maxDifferingLines))
  .filter((cluster) => cluster.length >= filters.minClusterSize)
  .sort((first, second) => second.length - first.length);
