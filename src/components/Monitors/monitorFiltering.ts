import { matchesRegexFilters } from '../../common/regexFiltering';
import MonitorOverTime from './MonitorOverTime';

export interface MonitorFilters {
  withOwner: boolean;
  withoutIdle: boolean;
  withoutOwner: boolean;
  nameFilter: string;
  stackFilter: string;
}

const hasAnyOwner = (monitorOverTime: MonitorOverTime): boolean => monitorOverTime.monitors.some((monitor) => !!monitor.owner);

const isIdle = (monitorOverTime: MonitorOverTime): boolean => {
  for (const monitor of monitorOverTime.monitors) {
    if (monitor.owner) {
      return monitor.owner.name === 'Reference Handler'
        || monitor.owner.name.startsWith('Structure-ValueCacheCleaner');
    }

    if (monitor.waiting.some((thread) => thread.stackTrace.length > 16)) {
      return false;
    }
  }

  return true;
};

const matchesFilters = (monitorOverTime: MonitorOverTime, filters: MonitorFilters): boolean => monitorOverTime.monitors
  .some((monitor) => [...monitor.waiting, ...(monitor.owner ? [monitor.owner] : [])]
    .some((thread) => matchesRegexFilters(thread, filters.nameFilter, filters.stackFilter)));

export const filterMonitors = (
  monitors: MonitorOverTime[],
  filters: MonitorFilters,
): MonitorOverTime[] => monitors
  .filter((monitor) => monitor.waitingSum > 0)
  .filter((monitor) => !filters.withoutIdle || !isIdle(monitor))
  .filter((monitor) => !filters.withOwner || hasAnyOwner(monitor))
  .filter((monitor) => !filters.withoutOwner || !hasAnyOwner(monitor))
  .filter((monitor) => (!filters.nameFilter && !filters.stackFilter) || matchesFilters(monitor, filters));
