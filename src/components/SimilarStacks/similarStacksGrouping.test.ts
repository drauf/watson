import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';
import { groupSimilarStacks, SimilarStacksFilters } from './similarStacksGrouping';

const defaultFilters = (): SimilarStacksFilters => ({
  linesToConsider: 2,
  withoutIdle: false,
  nameFilter: '',
  stackFilter: '',
});

const createThread = (id: number, name: string, stackTrace: string[]): Thread => {
  const thread = new Thread(id, name);
  thread.stackTrace.push(...stackTrace);
  return thread;
};

const createDump = (threads: Thread[]): ThreadDump => {
  const dump = new ThreadDump(Date.now());
  dump.threads.push(...threads);
  return dump;
};

describe('groupSimilarStacks', () => {
  it('groups matching stack prefixes and orders the largest group first', () => {
    const groups = groupSimilarStacks([
      createDump([
        createThread(1, 'worker-1', ['app.Work.run', 'app.Request.handle', 'java.lang.Thread.run']),
        createThread(2, 'worker-2', ['app.Work.run', 'app.Request.handle', 'other.Frame']),
        createThread(3, 'other', ['other.Work.run']),
      ]),
    ], defaultFilters());

    expect(groups.map((group) => group.length)).toEqual([2, 1]);
  });

  it('uses the entire stack when comparison depth is zero', () => {
    const groups = groupSimilarStacks([
      createDump([
        createThread(1, 'worker-1', ['app.Work.run', 'first.Tail']),
        createThread(2, 'worker-2', ['app.Work.run', 'second.Tail']),
      ]),
    ], { ...defaultFilters(), linesToConsider: 0 });

    expect(groups).toHaveLength(2);
  });

  it('applies name and stack regular expression filters before grouping', () => {
    const groups = groupSimilarStacks([
      createDump([
        createThread(1, 'http-nio-1', ['org.apache.lucene.search.IndexSearcher.search']),
        createThread(2, 'worker-2', ['org.apache.lucene.search.IndexSearcher.search']),
      ]),
    ], { ...defaultFilters(), nameFilter: '^http', stackFilter: 'lucene' });

    expect(groups).toHaveLength(1);
    expect(groups[0]).toHaveLength(1);
    expect(groups[0][0].name).toBe('http-nio-1');
  });
});
