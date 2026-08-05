import { useCallback, useState, type JSX } from 'react';
import Thread from '../../types/Thread';
import ThreadStatus from '../../types/ThreadStatus';
import ThreadsOverviewTable from './ThreadsOverviewTable';
import { createThreadOverviewRows } from './threadsOverviewRows';
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

interface TablePreviewProps {
  testId: string;
  children: (getScrollElement: () => HTMLElement | null) => JSX.Element;
}

const TablePreview = ({ testId, children }: TablePreviewProps): JSX.Element => {
  const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);
  const setScrollElementRef = useCallback((element: HTMLElement | null) => setScrollElement(element), []);

  return (
    <section ref={setScrollElementRef} data-testid={testId} style={{ height: 320, overflow: 'auto' }}>
      {scrollElement && children(() => scrollElement)}
    </section>
  );
};

export const Basic = (): JSX.Element => {
  const threeDumpRows = createTableRows(3);
  const matchingStackFilter = new Set([threeDumpRows[0].get(0)!.uniqueId]);

  return (
    <main className="full-width-page">
      <TablePreview testId="three-dump-table">
        {(getScrollElement) => (
          <ThreadsOverviewTable
            dates={createDates(3)}
            rows={createThreadOverviewRows(threeDumpRows)}
            matchingStackFilter={matchingStackFilter}
            dumpColumnWidth={160}
            stackPreviewLines={10}
            getScrollElement={getScrollElement}
          />
        )}
      </TablePreview>
      <TablePreview testId="many-dump-table">
        {(getScrollElement) => (
          <ThreadsOverviewTable
            dates={createDates(12)}
            rows={createThreadOverviewRows(createTableRows(12))}
            matchingStackFilter={new Set()}
            dumpColumnWidth={160}
            stackPreviewLines={10}
            getScrollElement={getScrollElement}
          />
        )}
      </TablePreview>
    </main>
  );
};

const createLargeTableRows = (): Map<number, Thread>[] => Array.from(
  { length: 1000 },
  (_, rowIndex) => new Map(Array.from(
    { length: 100 },
    (_unused, dumpIndex) => [
      dumpIndex,
      createThread(rowIndex + 1, `worker-${rowIndex}`, dumpIndex),
    ],
  )),
);

export const Large = (): JSX.Element => (
  <main className="full-width-page">
    <TablePreview testId="large-table">
      {(getScrollElement) => (
        <ThreadsOverviewTable
          dates={createDates(100)}
          rows={createThreadOverviewRows(createLargeTableRows())}
          matchingStackFilter={new Set()}
          dumpColumnWidth={160}
          stackPreviewLines={10}
          getScrollElement={getScrollElement}
        />
      )}
    </TablePreview>
  </main>
);

export default Basic;
