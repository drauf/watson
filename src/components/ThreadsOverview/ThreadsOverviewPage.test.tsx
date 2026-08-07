import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';
import ThreadStatus from '../../types/ThreadStatus';
import { ThreadsOverviewPage } from './ThreadsOverviewPage';
import type { ThreadOverviewDataRow } from './threadsOverviewRows';

vi.mock('../TimeWindow/TimeWindowFilter', () => ({
  default: () => null,
}));

vi.mock('./ThreadsOverviewTable', () => ({
  default: ({
    rows,
    matchingStackFilter,
  }: {
    rows: ThreadOverviewDataRow[];
    matchingStackFilter: Set<number>;
  }) => (
    <div data-matching-snapshot-count={matchingStackFilter.size} data-testid="threads-overview-table">
      {rows.map((row) => (
        <div key={row.id}>
          {row.name}
          :
          {' '}
          {row.threadsByDump.size}
          {' '}
          snapshots
        </div>
      ))}
    </div>
  ),
}));

const createThread = (id: number, name: string, stackTrace: string[]): Thread => {
  const thread = new Thread(id, name);
  thread.status = ThreadStatus.RUNNABLE;
  thread.stackTrace.push(...stackTrace);
  return thread;
};

const renderPage = (): void => {
  const firstDump = new ThreadDump(Date.UTC(2026, 7, 7, 10, 0));
  const secondDump = new ThreadDump(Date.UTC(2026, 7, 7, 10, 1));

  firstDump.threads.push(
    createThread(1, 'matching-worker', ['app.Database.query']),
    createThread(2, 'non-matching-worker', ['app.Work.run']),
  );
  secondDump.threads.push(
    createThread(1, 'matching-worker', ['app.Work.run']),
    createThread(2, 'non-matching-worker', ['app.Work.run']),
  );

  render(<ThreadsOverviewPage threadDumps={[firstDump, secondDump]} />);
};

describe('ThreadsOverviewPage', () => {
  it('hides rows without matching snapshots while preserving matching thread history', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Active' }));

    expect(screen.getByText('matching-worker: 2 snapshots')).toBeInTheDocument();
    expect(screen.getByText('non-matching-worker: 2 snapshots')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Stack trace pattern'), { target: { value: 'database' } });

    expect(screen.getByText('Showing 1 of 2 threads (50.0%)')).toBeInTheDocument();
    expect(screen.getByText('Highlighting 1 matching thread snapshots')).toBeInTheDocument();
    expect(screen.getByText('matching-worker: 2 snapshots')).toBeInTheDocument();
    expect(screen.queryByText('non-matching-worker: 2 snapshots')).not.toBeInTheDocument();
    expect(screen.getByTestId('threads-overview-table')).toHaveAttribute('data-matching-snapshot-count', '1');
  });
});
