import { isActiveOverTime } from '../../common/threadFilters';
import Thread from '../../types/Thread';

export interface ThreadsOverviewFilters {
  active: boolean;
  nonJvm: boolean;
  tomcat: boolean;
  nonTomcat: boolean;
  database: boolean;
  lucene: boolean;
  usingCpu: boolean;
  nameFilter: string;
  stackFilter: string;
}

const jvmRegex = /^Attach Listener|^C[12] CompilerThread|^G1 Concurrent |^G1 Main|^Gang worker#|^GC Daemon|^Service Thread|^Signal Dispatcher|^String Deduplication Thread|^Surrogate Locker Thread|^VM Periodic|^VM Thread/;
const tomcatRegex = /^https?-.*exec/;
const luceneRegex = /org\.apache\.lucene/;
const databaseRegex = /database|sql|query|jdbc|jooq|postgres|mysql|oracle|c3p0/i;

const matchesName = (threads: Map<number, Thread>, regex: RegExp): boolean => Array.from(
  threads.values(),
).some((thread) => regex.test(thread.name));

const isUsingCpu = (threads: Map<number, Thread>): boolean => Array.from(
  threads.values(),
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
  threadDumps: Map<number, Thread>[],
  filters: ThreadsOverviewFilters,
): Map<number, Thread>[] => {
  const nameRegex = toOptionalRegex(filters.nameFilter);

  return threadDumps
    .filter((threads) => !filters.active || isActiveOverTime(threads))
    .filter((threads) => !filters.usingCpu || isUsingCpu(threads))
    .filter((threads) => !filters.nonJvm || !matchesName(threads, jvmRegex))
    .filter((threads) => !filters.tomcat || matchesName(threads, tomcatRegex))
    .filter((threads) => !filters.nonTomcat || !matchesName(threads, tomcatRegex))
    .filter((threads) => !nameRegex || matchesName(threads, nameRegex));
};

const getStackTraceFilters = (filters: ThreadsOverviewFilters): RegExp[] => {
  const stackTraceFilters: RegExp[] = [];
  const stackRegex = toOptionalRegex(filters.stackFilter);

  if (stackRegex) {
    stackTraceFilters.push(stackRegex);
  }
  if (filters.lucene) {
    stackTraceFilters.push(luceneRegex);
  }
  if (filters.database) {
    stackTraceFilters.push(databaseRegex);
  }

  return stackTraceFilters;
};

export const getThreadsMatchingStackFilter = (
  threadDumps: Map<number, Thread>[],
  filters: ThreadsOverviewFilters,
): Set<number> => {
  const stackTraceFilters = getStackTraceFilters(filters);
  if (stackTraceFilters.length === 0) {
    return new Set();
  }

  return new Set(
    threadDumps
      .flatMap((threads) => Array.from(threads.values()))
      .filter((thread) => stackTraceFilters.every((filter) => thread.stackTrace.some((line) => filter.test(line))))
      .map((thread) => thread.uniqueId),
  );
};

export const isFilteredByStack = (filters: ThreadsOverviewFilters): boolean => Boolean(
  filters.stackFilter || filters.lucene || filters.database,
);
