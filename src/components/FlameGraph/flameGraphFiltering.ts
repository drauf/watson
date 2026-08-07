import { hasThreadLabel, ThreadLabel } from '../../common/threadLabels';
import { matchesNameFilter, matchesStackFilter } from '../../common/regexFiltering';
import { isIdleInSnapshot } from '../../common/threadFilters';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';

export interface FlameGraphFilters {
  withoutIdle: boolean;
  usingCpu: boolean;
  nameFilter: string;
  stackFilter: string;
}

export const filterFlameGraphThreads = (threadDumps: ThreadDump[], filters: FlameGraphFilters): Thread[] => threadDumps
  .flatMap((dump) => dump.threads)
  .filter((thread) => !filters.withoutIdle || !isIdleInSnapshot(thread))
  .filter((thread) => matchesNameFilter(thread, filters.nameFilter))
  .filter((thread) => matchesStackFilter(thread, filters.stackFilter))
  .filter((thread) => !filters.usingCpu || hasThreadLabel(thread, ThreadLabel.CPU_ACTIVE));
