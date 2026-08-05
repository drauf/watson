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
  http: false,
  nonHttp: false,
  database: false,
  indexSearch: false,
  crowd: false,
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

    const cpuHttpRows = filterThreads(rows, { ...defaultFilters(), http: true, usingCpu: true });
    const nonHttpRows = filterThreads(rows, { ...defaultFilters(), nonHttp: true });
    const nonJvmRows = filterThreads(rows, { ...defaultFilters(), nonJvm: true });
    const workerRows = filterThreads(rows, { ...defaultFilters(), nameFilter: '^worker' });

    expect(cpuHttpRows).toEqual([rows[0]]);
    expect(cpuHttpRows[0]).toBe(rows[0]);
    expect(nonHttpRows).toEqual([rows[1], rows[2]]);
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
    const openSearchOnlyThread = createThread(2, 'index', ['org.opensearch.index.engine.OpenSearchEngine.index']);
    const crowdOnlyThread = createThread(3, 'directory', ['com.atlassian.crowd.directory.DirectoryManager.findUser']);
    const jiraSearchOnlyThread = createThread(4, 'jira-search', ['com.atlassian.jira.search.SearchService.search']);
    const jiraCrowdOnlyThread = createThread(5, 'jira-crowd', ['com.atlassian.jira.crowd.embedded.CrowdDirectoryService.findUser']);
    const rows = [
      createRow(luceneDatabaseThread),
      createRow(openSearchOnlyThread),
      createRow(crowdOnlyThread),
      createRow(jiraSearchOnlyThread),
      createRow(jiraCrowdOnlyThread),
    ];
    const filters = { ...defaultFilters(), indexSearch: true, database: true };

    expect(getThreadsMatchingStackFilter(rows, filters)).toEqual(new Set([luceneDatabaseThread.uniqueId]));
    expect(isFilteredByStack(filters)).toBe(true);
    expect(getThreadsMatchingStackFilter(rows, { ...defaultFilters(), indexSearch: true })).toEqual(
      new Set([luceneDatabaseThread.uniqueId, openSearchOnlyThread.uniqueId]),
    );
    expect(getThreadsMatchingStackFilter(rows, { ...defaultFilters(), crowd: true })).toEqual(
      new Set([crowdOnlyThread.uniqueId, jiraCrowdOnlyThread.uniqueId]),
    );
  });

  it('does not report stack filtering when no stack filter is active', () => {
    expect(getThreadsMatchingStackFilter([], defaultFilters())).toEqual(new Set());
    expect(isFilteredByStack(defaultFilters())).toBe(false);
  });
});
