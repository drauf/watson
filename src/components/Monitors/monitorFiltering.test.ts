import Thread from '../../types/Thread';
import Monitor from './Monitor';
import MonitorOverTime from './MonitorOverTime';
import { filterMonitors, MonitorFilters } from './monitorFiltering';

const defaultFilters = (): MonitorFilters => ({
  withOwner: false,
  withoutIdle: false,
  withoutOwner: false,
  nameFilter: '',
  stackFilter: '',
});

const createThread = (id: number, name: string, stackTrace: string[] = []): Thread => {
  const thread = new Thread(id, name);
  thread.stackTrace.push(...stackTrace);
  return thread;
};

const createMonitor = (id: string, owner: Thread | undefined, waiting: Thread[]): MonitorOverTime => ({
  id,
  uniqueId: Number.parseInt(id, 10) || 1,
  waitingSum: waiting.length,
  monitors: [{ owner, waiting } as Monitor],
});

describe('filterMonitors', () => {
  it('filters owned and unowned monitors independently', () => {
    const owner = createThread(1, 'owner');
    const owned = createMonitor('owned', owner, [createThread(2, 'http-nio-1')]);
    const unowned = createMonitor('unowned', undefined, [createThread(3, 'http-nio-2')]);

    expect(filterMonitors([owned, unowned], { ...defaultFilters(), withOwner: true })).toEqual([owned]);
    expect(filterMonitors([owned, unowned], { ...defaultFilters(), withoutOwner: true })).toEqual([unowned]);
  });

  it('filters monitor participants by name and stack patterns', () => {
    const monitor = createMonitor('database', undefined, [
      createThread(1, 'http-nio-1', ['org.postgresql.jdbc.PgStatement.execute']),
    ]);

    expect(filterMonitors([monitor], { ...defaultFilters(), nameFilter: 'http', stackFilter: 'postgresql' })).toEqual([monitor]);
    expect(filterMonitors([monitor], { ...defaultFilters(), nameFilter: 'worker' })).toEqual([]);
  });
});
