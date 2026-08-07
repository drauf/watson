import { setStaticThreadLabels } from '../../common/threadLabels';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';
import { getStuckThreadClusters, StuckThreadsFilters } from './stuckThreadClustering';

const defaultFilters = (): StuckThreadsFilters => ({
  maxDifferingLines: 1,
  minClusterSize: 2,
  withoutIdle: false,
  nameFilter: '',
  stackFilter: '',
});

const createDump = (timestamp: number, stackTrace: string[]): ThreadDump => {
  const dump = new ThreadDump(timestamp);
  const thread = new Thread(1, 'http-nio-8080-exec-1', timestamp);
  thread.stackTrace.push(...stackTrace);
  setStaticThreadLabels(thread);
  dump.threads.push(thread);
  return dump;
};

describe('getStuckThreadClusters', () => {
  it('groups consecutive snapshots within the configured stack tolerance', () => {
    const clusters = getStuckThreadClusters([
      createDump(1, ['app.Work.run', 'java.lang.Thread.run']),
      createDump(2, ['app.Work.run', 'java.lang.Thread.run']),
      createDump(3, ['different.Work.run', 'different.Middle.run', 'different.Tail.run']),
    ], defaultFilters());

    expect(clusters).toHaveLength(1);
    expect(clusters[0]).toHaveLength(2);
  });

  it('filters snapshots by name and stack before clustering', () => {
    const clusters = getStuckThreadClusters([
      createDump(1, ['org.apache.lucene.search.IndexSearcher.search']),
      createDump(2, ['org.apache.lucene.search.IndexSearcher.search']),
    ], { ...defaultFilters(), nameFilter: 'http', stackFilter: 'lucene' });

    expect(clusters).toHaveLength(1);
    expect(clusters[0]).toHaveLength(2);
  });

  it('filters snapshots by stored labels before clustering', () => {
    const clusters = getStuckThreadClusters([
      createDump(1, ['org.apache.lucene.search.IndexSearcher.search']),
      createDump(2, ['org.apache.lucene.search.IndexSearcher.search']),
      createDump(3, ['org.postgresql.jdbc.PgStatement.execute']),
    ], { ...defaultFilters(), indexSearch: true });

    expect(clusters).toHaveLength(1);
    expect(clusters[0]).toHaveLength(2);
  });

  it('does not return clusters below the minimum size', () => {
    const clusters = getStuckThreadClusters([
      createDump(1, ['app.Work.run']),
      createDump(2, ['different.Work.run', 'different.Middle.run', 'different.Tail.run']),
    ], defaultFilters());

    expect(clusters).toEqual([]);
  });
});
