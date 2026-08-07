import { matchesRegexFilters } from '../../common/regexFiltering';
import { isIdleInSnapshot } from '../../common/threadFilters';
import { matchesThreadLabelFilters, ThreadLabelFilters } from '../../common/threadLabelFiltering';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';

export interface SimilarStacksFilters extends ThreadLabelFilters {
  linesToConsider: number;
  withoutIdle: boolean;
  nameFilter: string;
  stackFilter: string;
}

const getStackTrace = (thread: Thread, filters: SimilarStacksFilters): string | undefined => {
  if (filters.withoutIdle && isIdleInSnapshot(thread)) {
    return undefined;
  }
  if (!matchesRegexFilters(thread, filters.nameFilter, filters.stackFilter)) {
    return undefined;
  }
  if (!matchesThreadLabelFilters(thread, filters)) {
    return undefined;
  }

  return filters.linesToConsider < 1
    ? thread.stackTrace.toString()
    : thread.stackTrace.slice(0, filters.linesToConsider).toString();
};

export const groupSimilarStacks = (
  threadDumps: ThreadDump[],
  filters: SimilarStacksFilters,
): Thread[][] => {
  const grouped = new Map<string, Thread[]>();

  threadDumps.forEach((threadDump) => {
    threadDump.threads.forEach((thread) => {
      const stackTrace = getStackTrace(thread, filters);
      if (!stackTrace) {
        return;
      }

      const threads = grouped.get(stackTrace) ?? [];
      threads.push(thread);
      grouped.set(stackTrace, threads);
    });
  });

  return Array.from(grouped.values()).sort((first, second) => second.length - first.length);
};
