import Thread from '../../types/Thread';
import ThreadStatus from '../../types/ThreadStatus';
import {
  filterThreads,
  getThreadsMatchingStackFilter,
  isFilteredByStack,
  ThreadsOverviewFilters,
} from './threadsOverviewFilters';
import { ThreadOverviewDataRow } from './threadsOverviewRows';

const defaultFilters = (): ThreadsOverviewFilters => ({
  active: false,
  nonJvm: false,
  tomcat: false,
  nonTomcat: false,
  database: false,
  lucene: false,
  usingCpu: false,
  nameFilter: '',
  stackFilter: '',
});

const createThread = (id: number, name: string, stackTrace: string[] = [], cpuUsage = '0.00'): Thread => {
  const thread = new Thread(id, name);
  thread.stackTrace.push(...stackTrace);
  thread.cpuUsage = cpuUsage;
  thread.status = ThreadStatus.RUNNABLE;
  return thread;
};

const createRow = (thread: Thread): ThreadOverviewDataRow => ({
  id: thread.id,
  name: thread.name,
  threadsByDump: new Map([[0, thread]]),
});

describe('threadsOverviewFilters', () => {
  it('filters thread rows by name, CPU usage, and JVM classification', () => {
    const httpThread = createThread(1, 'http-nio-8080-exec-1', ['app.Request.handle'], '12.50');
    const jvmThread = createThread(2, 'GC Daemon', ['java.lang.System.gc']);
    const workerThread = createThread(3, 'worker-1', ['app.Work.run']);
    const rows = [
      createRow(httpThread),
      createRow(jvmThread),
      createRow(workerThread),
    ];

    const cpuTomcatRows = filterThreads(rows, { ...defaultFilters(), tomcat: true, usingCpu: true });
    const nonJvmRows = filterThreads(rows, { ...defaultFilters(), nonJvm: true });
    const workerRows = filterThreads(rows, { ...defaultFilters(), nameFilter: '^worker' });

    expect(cpuTomcatRows).toEqual([rows[0]]);
    expect(cpuTomcatRows[0]).toBe(rows[0]);
    expect(nonJvmRows).toEqual([rows[0], rows[2]]);
    expect(workerRows).toEqual([rows[2]]);
  });

  it('ignores an invalid name regular expression', () => {
    const rows = [createRow(createThread(1, 'worker-1'))];

    expect(filterThreads(rows, { ...defaultFilters(), nameFilter: '[' })).toEqual(rows);
  });

  it('matches stack snapshots only when every active stack filter matches', () => {
    const luceneDatabaseThread = createThread(1, 'search', [
      'org.apache.lucene.search.IndexSearcher.search',
      'org.postgresql.jdbc.PgStatement.execute',
    ]);
    const luceneOnlyThread = createThread(2, 'index', ['org.apache.lucene.index.Writer']);
    const rows = [
      createRow(luceneDatabaseThread),
      createRow(luceneOnlyThread),
    ];
    const filters = { ...defaultFilters(), lucene: true, database: true };

    expect(getThreadsMatchingStackFilter(rows, filters)).toEqual(new Set([luceneDatabaseThread.uniqueId]));
    expect(isFilteredByStack(filters)).toBe(true);
  });

  it('does not report stack filtering when no stack filter is active', () => {
    expect(getThreadsMatchingStackFilter([], defaultFilters())).toEqual(new Set());
    expect(isFilteredByStack(defaultFilters())).toBe(false);
  });
});
