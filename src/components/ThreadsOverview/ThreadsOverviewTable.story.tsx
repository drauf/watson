import Thread from '../../types/Thread';
import ThreadStatus from '../../types/ThreadStatus';
import ThreadsOverviewTable from './ThreadsOverviewTable';
import './ThreadsOverviewPage.css';

const createThread = (id: number, name: string, dumpIndex: number): Thread => {
  const thread = new Thread(id, name, Date.UTC(2026, 6, 22, 10, 0, dumpIndex * 5));
  thread.status = dumpIndex % 2 === 0 ? ThreadStatus.RUNNABLE : ThreadStatus.WAITING;
  thread.stackTrace.push(
    `com.atlassian.watson.analysis.LongRunningRequestCoordinator$Worker.process(RequestCoordinator.java:${42 + dumpIndex})`,
    'org.apache.lucene.search.IndexSearcher.search(IndexSearcher.java:123)',
  );
  return thread;
};

const createTableRows = (dumpCount: number): Map<number, Thread>[] => [
  new Map(Array.from({ length: dumpCount }, (_, index) => [index, createThread(index + 1, 'http-nio-8080-exec-12', index)])),
  new Map(Array.from({ length: dumpCount }, (_, index) => [index, createThread(100 + index, 'async-worker-3', index)])),
];

const createDates = (dumpCount: number): string[] => Array.from(
  { length: dumpCount },
  (_, index) => `10:${String(index * 5).padStart(2, '0')}:00`,
);

const Basic = (): JSX.Element => (
  <main className="full-width-page">
    <section data-testid="three-dump-table">
      <ThreadsOverviewTable
        dates={createDates(3)}
        threadDumps={createTableRows(3)}
        matchingStackFilter={new Set()}
        dumpColumnWidth={160}
        stackPreviewLines={10}
      />
    </section>
    <section data-testid="many-dump-table">
      <ThreadsOverviewTable
        dates={createDates(12)}
        threadDumps={createTableRows(12)}
        matchingStackFilter={new Set()}
        dumpColumnWidth={160}
        stackPreviewLines={10}
      />
    </section>
  </main>
);

export default Basic;
