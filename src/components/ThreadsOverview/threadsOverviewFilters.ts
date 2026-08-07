import {
  hasThreadLabel,
  isJvmHousekeepingThread,
  ThreadLabel,
} from '../../common/threadLabels';
import { isActiveOverTime } from '../../common/threadFilters';
import { ThreadOverviewDataRow } from './threadsOverviewRows';

export interface ThreadsOverviewFilters {
  active: boolean;
  nonJvm: boolean;
  http: boolean;
  nonHttp: boolean;
  database: boolean;
  indexSearch: boolean;
  crowd: boolean;
  usingCpu: boolean;
  nameFilter: string;
  stackFilter: string;
}

const matchesName = (row: ThreadOverviewDataRow, regex: RegExp): boolean => Array.from(
  row.threadsByDump.values(),
).some((thread) => regex.test(thread.name));

const matchesLabel = (row: ThreadOverviewDataRow, label: ThreadLabel): boolean => Array.from(
  row.threadsByDump.values(),
).some((thread) => hasThreadLabel(thread, label));

const toOptionalRegex = (value: string): RegExp | undefined => {
  if (!value) {
    return undefined;
  }

  try {
    return new RegExp(value, 'i');
  } catch {
    return undefined;
  }
};

export const filterThreads = (
  rows: ThreadOverviewDataRow[],
  filters: ThreadsOverviewFilters,
): ThreadOverviewDataRow[] => {
  const nameRegex = toOptionalRegex(filters.nameFilter);

  return rows
    .filter((row) => !filters.active || isActiveOverTime(row.threadsByDump))
    .filter((row) => !filters.usingCpu || matchesLabel(row, ThreadLabel.CPU_ACTIVE))
    .filter((row) => !filters.nonJvm || !Array.from(row.threadsByDump.values()).some(isJvmHousekeepingThread))
    .filter((row) => !filters.http || matchesLabel(row, ThreadLabel.HTTP))
    .filter((row) => !filters.nonHttp || matchesLabel(row, ThreadLabel.BACKGROUND))
    .filter((row) => !nameRegex || matchesName(row, nameRegex));
};

const getStackTraceFilters = (filters: ThreadsOverviewFilters): RegExp[] => {
  const stackTraceFilters: RegExp[] = [];
  const stackRegex = toOptionalRegex(filters.stackFilter);

  if (stackRegex) {
    stackTraceFilters.push(stackRegex);
  }
  return stackTraceFilters;
};

export interface StackFilterMatches {
  matchingRowIds: Set<number>;
  matchingThreadIds: Set<number>;
}

export const getStackFilterMatches = (
  rows: ThreadOverviewDataRow[],
  filters: ThreadsOverviewFilters,
): StackFilterMatches => {
  const stackTraceFilters = getStackTraceFilters(filters);
  const matchingRowIds = new Set<number>();
  const matchingThreadIds = new Set<number>();

  if (stackTraceFilters.length === 0 && !filters.indexSearch && !filters.crowd && !filters.database) {
    return { matchingRowIds, matchingThreadIds };
  }

  rows.forEach((row) => {
    row.threadsByDump.forEach((thread) => {
      const matchesStackFilters = stackTraceFilters.every(
        (filter) => thread.stackTrace.some((line) => filter.test(line)),
      );
      const matchesLabels = (!filters.indexSearch || hasThreadLabel(thread, ThreadLabel.INDEX_SEARCH))
        && (!filters.crowd || hasThreadLabel(thread, ThreadLabel.USER_DIRECTORY))
        && (!filters.database || hasThreadLabel(thread, ThreadLabel.DATABASE));

      if (matchesStackFilters && matchesLabels) {
        matchingRowIds.add(row.id);
        matchingThreadIds.add(thread.uniqueId);
      }
    });
  });

  return { matchingRowIds, matchingThreadIds };
};

export const isFilteredByStack = (filters: ThreadsOverviewFilters): boolean => Boolean(
  filters.stackFilter || filters.indexSearch || filters.crowd || filters.database,
);
