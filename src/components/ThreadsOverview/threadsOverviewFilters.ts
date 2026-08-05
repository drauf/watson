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

const jvmRegex = /^Attach Listener|^C[12] CompilerThread|^G1 Concurrent |^G1 Main|^Gang worker#|^GC Daemon|^Service Thread|^Signal Dispatcher|^String Deduplication Thread|^Surrogate Locker Thread|^VM Periodic|^VM Thread/;
const httpRegex = /^https?-.*exec/;
const indexSearchRegex = /org\.apache\.lucene|org\.opensearch/;
const crowdRegex = /com\.atlassian\.(crowd|jira\.crowd)\./;
const databaseRegex = /database|sql|query|jdbc|jooq|postgres|mysql|oracle|c3p0/i;

const matchesName = (row: ThreadOverviewDataRow, regex: RegExp): boolean => Array.from(
  row.threadsByDump.values(),
).some((thread) => regex.test(thread.name));

const isUsingCpu = (row: ThreadOverviewDataRow): boolean => Array.from(
  row.threadsByDump.values(),
).some((thread) => parseFloat(thread.cpuUsage) >= 10);

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
    .filter((row) => !filters.usingCpu || isUsingCpu(row))
    .filter((row) => !filters.nonJvm || !matchesName(row, jvmRegex))
    .filter((row) => !filters.http || matchesName(row, httpRegex))
    .filter((row) => !filters.nonHttp || !matchesName(row, httpRegex))
    .filter((row) => !nameRegex || matchesName(row, nameRegex));
};

const getStackTraceFilters = (filters: ThreadsOverviewFilters): RegExp[] => {
  const stackTraceFilters: RegExp[] = [];
  const stackRegex = toOptionalRegex(filters.stackFilter);

  if (stackRegex) {
    stackTraceFilters.push(stackRegex);
  }
  if (filters.indexSearch) {
    stackTraceFilters.push(indexSearchRegex);
  }
  if (filters.crowd) {
    stackTraceFilters.push(crowdRegex);
  }
  if (filters.database) {
    stackTraceFilters.push(databaseRegex);
  }

  return stackTraceFilters;
};

export const getThreadsMatchingStackFilter = (
  rows: ThreadOverviewDataRow[],
  filters: ThreadsOverviewFilters,
): Set<number> => {
  const stackTraceFilters = getStackTraceFilters(filters);
  if (stackTraceFilters.length === 0) {
    return new Set();
  }

  return new Set(
    rows
      .flatMap((row) => Array.from(row.threadsByDump.values()))
      .filter((thread) => stackTraceFilters.every((filter) => thread.stackTrace.some((line) => filter.test(line))))
      .map((thread) => thread.uniqueId),
  );
};

export const isFilteredByStack = (filters: ThreadsOverviewFilters): boolean => Boolean(
  filters.stackFilter || filters.indexSearch || filters.crowd || filters.database,
);
