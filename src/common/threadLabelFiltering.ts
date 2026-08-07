import { hasThreadLabel, ThreadLabel } from './threadLabels';
import Thread from '../types/Thread';

export interface ThreadLabelFilters {
  http?: boolean;
  background?: boolean;
  indexSearch?: boolean;
  database?: boolean;
  userDirectory?: boolean;
  cpuActive?: boolean;
}

export type ThreadLabelFilterState = Required<ThreadLabelFilters>;

export const defaultThreadLabelFilterState: ThreadLabelFilterState = {
  http: false,
  background: false,
  indexSearch: false,
  database: false,
  userDirectory: false,
  cpuActive: false,
};

export const matchesThreadLabelFilters = (thread: Thread, filters: ThreadLabelFilters): boolean => (
  (!filters.http || hasThreadLabel(thread, ThreadLabel.HTTP))
  && (!filters.background || hasThreadLabel(thread, ThreadLabel.BACKGROUND))
  && (!filters.indexSearch || hasThreadLabel(thread, ThreadLabel.INDEX_SEARCH))
  && (!filters.database || hasThreadLabel(thread, ThreadLabel.DATABASE))
  && (!filters.userDirectory || hasThreadLabel(thread, ThreadLabel.USER_DIRECTORY))
  && (!filters.cpuActive || hasThreadLabel(thread, ThreadLabel.CPU_ACTIVE))
);

export const isAnyThreadLabelFilterActive = (filters: ThreadLabelFilters): boolean => Boolean(
  filters.http || filters.background || filters.indexSearch
  || filters.database || filters.userDirectory || filters.cpuActive,
);
