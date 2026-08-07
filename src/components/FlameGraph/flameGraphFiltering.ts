import { matchesThreadLabelFilters, ThreadLabelFilters } from '../../common/threadLabelFiltering';
import { matchesNameFilter, matchesStackFilter } from '../../common/regexFiltering';
import { isIdleInSnapshot } from '../../common/threadFilters';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';

export interface FlameGraphFilters extends ThreadLabelFilters {
  withoutIdle: boolean;
  nameFilter: string;
  stackFilter: string;
}

export const filterFlameGraphThreads = (threadDumps: ThreadDump[], filters: FlameGraphFilters): Thread[] => threadDumps
  .flatMap((dump) => dump.threads)
  .filter((thread) => !filters.withoutIdle || !isIdleInSnapshot(thread))
  .filter((thread) => matchesNameFilter(thread, filters.nameFilter))
  .filter((thread) => matchesStackFilter(thread, filters.stackFilter))
  .filter((thread) => matchesThreadLabelFilters(thread, filters));
