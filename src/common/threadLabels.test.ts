import Thread from '../types/Thread';
import {
  CPU_ACTIVE_THRESHOLD,
  getStaticThreadLabels,
  getThreadGroupLabels,
  getThreadLabelAppearance,
  getThreadLabelDisplayName,
  hasThreadLabel,
  isJvmHousekeepingThread,
  setStaticThreadLabels,
  ThreadLabel,
  updateCpuActiveLabel,
} from './threadLabels';

const createThread = (name: string, stackTrace: string[] = []): Thread => {
  const thread = new Thread(1, name);
  thread.stackTrace.push(...stackTrace);
  return thread;
};

const labeledThread = (name: string, labels: ThreadLabel[]): Thread => {
  const thread = createThread(name);
  thread.labels = labels;
  return thread;
};

describe('threadLabels', () => {
  describe('isJvmHousekeepingThread', () => {
    it.each([
      'Attach Listener',
      'C1 CompilerThread0',
      'C2 CompilerThread1',
      'G1 Conc#0',
      'G1 Concurrent Mark',
      'G1 Main Marker',
      'G1 Refine#2',
      'Gang worker#4',
      'GC Daemon',
      'GC Thread#13',
      'Service Thread',
      'Signal Dispatcher',
      'String Deduplication Thread',
      'Surrogate Locker Thread',
      'VM Periodic Task Thread',
      'VM Thread',
    ])('recognizes %s as JVM housekeeping', (name) => {
      expect(isJvmHousekeepingThread(createThread(name))).toBe(true);
    });

    it.each([
      'GC Thread Manager',
      'G1 Conc Worker',
      'application-G1 Refine#2',
      'worker-1',
    ])('does not classify %s as JVM housekeeping', (name) => {
      expect(isJvmHousekeepingThread(createThread(name))).toBe(false);
    });
  });

  describe('getStaticThreadLabels', () => {
    it.each([
      ['HTTP executor', 'http-nio-8080-exec-1', [], [ThreadLabel.HTTP]],
      ['background thread', 'scheduler-1', [], [ThreadLabel.BACKGROUND]],
      ['Lucene', 'worker-1', ['org.apache.lucene.search.IndexSearcher.search'], [ThreadLabel.BACKGROUND, ThreadLabel.INDEX_SEARCH]],
      ['OpenSearch', 'worker-1', ['org.opensearch.index.engine.OpenSearchEngine.index'], [ThreadLabel.BACKGROUND, ThreadLabel.INDEX_SEARCH]],
      ['JDBC', 'worker-1', ['org.postgresql.jdbc.PgStatement.execute'], [ThreadLabel.BACKGROUND, ThreadLabel.DATABASE]],
      ['JOOQ', 'worker-1', ['org.jooq.impl.AbstractQuery.execute'], [ThreadLabel.BACKGROUND, ThreadLabel.DATABASE]],
      ['Crowd', 'worker-1', ['com.atlassian.crowd.directory.DirectoryManager.findUser'], [ThreadLabel.BACKGROUND, ThreadLabel.USER_DIRECTORY]],
      ['Jira Crowd', 'worker-1', ['com.atlassian.jira.crowd.embedded.CrowdDirectoryService.findUser'], [ThreadLabel.BACKGROUND, ThreadLabel.USER_DIRECTORY]],
    ])('classifies %s evidence', (_description, name, stackTrace, expectedLabels) => {
      expect(getStaticThreadLabels(createThread(name, stackTrace))).toEqual(expectedLabels);
    });

    it('combines all applicable static labels in display order', () => {
      expect(getStaticThreadLabels(createThread('http-nio-8080-exec-1', [
        'com.atlassian.jira.crowd.embedded.CrowdDirectoryService.findUser',
        'org.postgresql.jdbc.PgStatement.execute',
        'org.apache.lucene.search.IndexSearcher.search',
      ]))).toEqual([
        ThreadLabel.HTTP,
        ThreadLabel.INDEX_SEARCH,
        ThreadLabel.DATABASE,
        ThreadLabel.USER_DIRECTORY,
      ]);
    });

    it('does not mistake Crowd HTTP filters for user-directory work', () => {
      expect(getStaticThreadLabels(createThread('worker-1', [
        'com.atlassian.crowd.filter.CrowdHttpFilter.doFilter',
      ]))).toEqual([ThreadLabel.BACKGROUND]);
    });

    it('replaces stale labels when assigning static labels', () => {
      const thread = createThread('worker-1', ['org.apache.lucene.search.IndexSearcher.search']);
      thread.labels = [ThreadLabel.CPU_ACTIVE];

      setStaticThreadLabels(thread);

      expect(thread.labels).toEqual([ThreadLabel.BACKGROUND, ThreadLabel.INDEX_SEARCH]);
    });
  });

  describe('updateCpuActiveLabel', () => {
    it('adds CPU active at the inclusive threshold while preserving static labels', () => {
      const thread = createThread('worker-1', ['org.postgresql.jdbc.PgStatement.execute']);
      setStaticThreadLabels(thread);
      thread.cpuUsage = CPU_ACTIVE_THRESHOLD.toString();

      updateCpuActiveLabel(thread);

      expect(thread.labels).toEqual([
        ThreadLabel.BACKGROUND,
        ThreadLabel.DATABASE,
        ThreadLabel.CPU_ACTIVE,
      ]);
    });

    it.each(['9.99', '', 'not-a-number'])('removes CPU active below or without a usable CPU value: %s', (cpuUsage) => {
      const thread = labeledThread('worker-1', [ThreadLabel.BACKGROUND, ThreadLabel.CPU_ACTIVE]);
      thread.cpuUsage = cpuUsage;

      updateCpuActiveLabel(thread);

      expect(thread.labels).toEqual([ThreadLabel.BACKGROUND]);
    });

    it('does not duplicate CPU active when enrichment runs again', () => {
      const thread = labeledThread('worker-1', [ThreadLabel.BACKGROUND, ThreadLabel.CPU_ACTIVE]);
      thread.cpuUsage = '12.50';

      updateCpuActiveLabel(thread);

      expect(thread.labels).toEqual([ThreadLabel.BACKGROUND, ThreadLabel.CPU_ACTIVE]);
    });
  });

  describe('hasThreadLabel', () => {
    it('treats old persisted snapshots without labels as unlabeled', () => {
      expect(hasThreadLabel({} as Thread, ThreadLabel.DATABASE)).toBe(false);
    });
  });

  describe('getThreadGroupLabels', () => {
    it('returns no labels for an empty group or unlabeled snapshots', () => {
      expect(getThreadGroupLabels([])).toEqual([]);
      expect(getThreadGroupLabels([{} as Thread])).toEqual([]);
    });

    it('shows HTTP only for uniform HTTP groups and includes any workload labels', () => {
      expect(getThreadGroupLabels([
        labeledThread('http-nio-8080-exec-1', [ThreadLabel.HTTP, ThreadLabel.INDEX_SEARCH]),
        labeledThread('http-nio-8080-exec-2', [ThreadLabel.HTTP, ThreadLabel.CPU_ACTIVE]),
      ])).toEqual([
        ThreadLabel.HTTP,
        ThreadLabel.INDEX_SEARCH,
        ThreadLabel.CPU_ACTIVE,
      ]);
    });

    it('shows Background only for uniform background groups', () => {
      expect(getThreadGroupLabels([
        labeledThread('scheduler-1', [ThreadLabel.BACKGROUND]),
        labeledThread('scheduler-2', [ThreadLabel.BACKGROUND, ThreadLabel.DATABASE]),
      ])).toEqual([ThreadLabel.BACKGROUND, ThreadLabel.DATABASE]);
    });

    it('omits execution context for mixed groups while retaining workload labels', () => {
      expect(getThreadGroupLabels([
        labeledThread('http-nio-8080-exec-1', [ThreadLabel.HTTP]),
        labeledThread('scheduler-1', [ThreadLabel.BACKGROUND, ThreadLabel.USER_DIRECTORY]),
      ])).toEqual([ThreadLabel.USER_DIRECTORY]);
    });
  });

  describe('label presentation', () => {
    it.each([
      [ThreadLabel.HTTP, 'HTTP', 'discovery'],
      [ThreadLabel.BACKGROUND, 'Background', 'discovery'],
      [ThreadLabel.INDEX_SEARCH, 'Index search', 'accent-yellow'],
      [ThreadLabel.DATABASE, 'Database', 'accent-yellow'],
      [ThreadLabel.USER_DIRECTORY, 'User directory', 'accent-yellow'],
      [ThreadLabel.CPU_ACTIVE, 'CPU active', 'accent-blue'],
    ] as const)('maps %s to its display name and semantic color', (label, displayName, appearance) => {
      expect(getThreadLabelDisplayName(label)).toBe(displayName);
      expect(getThreadLabelAppearance(label)).toBe(appearance);
    });
  });
});
