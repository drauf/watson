import {
  fireEvent, render, screen,
} from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';
import Thread from '../../types/Thread';
import ThreadStatus from '../../types/ThreadStatus';
import { openThreadDetailsPopup } from '../ThreadDetails/useOpenThreadDetails';
import ThreadsOverviewTable from './ThreadsOverviewTable';
import { ThreadOverviewDataRow } from './threadsOverviewRows';

vi.mock('../common/HoverPopup', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../ThreadDetails/ThreadDetailsPopup', () => ({
  default: ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
    <div data-testid="thread-details-popup">
      {children}
      <button type="button" onClick={onClose}>Close</button>
    </div>
  ),
}));

vi.mock('../ThreadDetails/ThreadDetailsWindow', () => ({
  default: ({ thread }: { thread: Thread }) => <div data-testid={`thread-details-${thread.uniqueId}`}>{thread.name}</div>,
}));

vi.mock('../ThreadDetails/useOpenThreadDetails', () => ({
  openThreadDetailsPopup: vi.fn(),
}));

const createThread = (id: number, name: string, stackTrace: string[]): Thread => {
  const thread = new Thread(id, name);
  thread.status = ThreadStatus.RUNNABLE;
  thread.stackTrace.push(...stackTrace);
  return thread;
};

const createRow = (thread: Thread, threadsByDump = new Map([[0, thread]])): ThreadOverviewDataRow => ({
  id: thread.id,
  name: thread.name,
  threadsByDump,
});

const table = (rows: ThreadOverviewDataRow[], dumpColumnWidth = 160) => (
  <ThreadsOverviewTable
    dates={['10:00:00', '10:00:05', '10:00:10']}
    rows={rows}
    matchingStackFilter={new Set()}
    dumpColumnWidth={dumpColumnWidth}
    stackPreviewLines={10}
  />
);

const renderTable = (rows: ThreadOverviewDataRow[], dumpColumnWidth = 160) => render(
  table(rows, dumpColumnWidth),
);

describe('ThreadsOverviewTable', () => {
  beforeEach(() => vi.mocked(openThreadDetailsPopup).mockReset());

  it('uses a fixed name column and a configured minimum table width', () => {
    const thread = createThread(1, 'http-nio-8080-exec-1', ['app.Request.handle']);
    const { container } = renderTable([
      createRow(thread, new Map([
        [0, thread],
        [1, createThread(2, 'http-nio-8080-exec-1', ['app.Request.handle'])],
        [2, createThread(3, 'http-nio-8080-exec-1', ['app.Request.handle'])],
      ])),
    ]);

    expect(container.querySelector('.threads-overview-name-column')).toHaveStyle({ width: '240px' });
    expect(container.querySelector('.threads-overview-table')).toHaveStyle({ minWidth: '720px' });
    expect(screen.getByText('http-nio-8080-exec-1')).toBeInTheDocument();
  });

  it('uses fit-columns mode when the configured minimum width is zero', () => {
    const thread = createThread(1, 'worker-1', ['app.Work.run']);
    const { container } = renderTable([createRow(thread)], 0);

    expect(container.querySelector('.threads-overview-table')).toHaveClass('threads-overview-table-fit-columns');
    expect(container.querySelector('.threads-overview-table')).not.toHaveStyle({ minWidth: '560px' });
  });

  it('keeps multiple detail windows open and focuses an existing snapshot', () => {
    const firstThread = createThread(1, 'worker-1', ['first.frame']);
    const secondThread = createThread(2, 'worker-2', ['second.frame']);
    const firstPopup = { closed: false, close: vi.fn(), focus: vi.fn() } as unknown as Window;
    const secondPopup = { closed: false, close: vi.fn(), focus: vi.fn() } as unknown as Window;
    vi.mocked(openThreadDetailsPopup)
      .mockReturnValueOnce({ popup: firstPopup, container: document.createElement('div') })
      .mockReturnValueOnce({ popup: secondPopup, container: document.createElement('div') });

    renderTable([createRow(firstThread), createRow(secondThread)]);

    fireEvent.click(screen.getByText('first.frame'));
    fireEvent.click(screen.getByText('second.frame'));

    expect(openThreadDetailsPopup).toHaveBeenCalledTimes(2);
    expect(screen.getAllByTestId('thread-details-popup')).toHaveLength(2);

    fireEvent.click(screen.getByText('first.frame'));

    expect(openThreadDetailsPopup).toHaveBeenCalledTimes(2);
    expect(firstPopup.focus).toHaveBeenCalledOnce();
  });

  it('removes only the closed detail window and closes remaining windows on unmount', () => {
    const firstThread = createThread(1, 'worker-1', ['first.frame']);
    const secondThread = createThread(2, 'worker-2', ['second.frame']);
    const firstPopup = { closed: false, close: vi.fn(), focus: vi.fn() } as unknown as Window;
    const secondPopup = { closed: false, close: vi.fn(), focus: vi.fn() } as unknown as Window;
    vi.mocked(openThreadDetailsPopup)
      .mockReturnValueOnce({ popup: firstPopup, container: document.createElement('div') })
      .mockReturnValueOnce({ popup: secondPopup, container: document.createElement('div') });

    const { rerender, unmount } = renderTable([createRow(firstThread), createRow(secondThread)]);
    fireEvent.click(screen.getByText('first.frame'));
    fireEvent.click(screen.getByText('second.frame'));

    rerender(table([]));
    expect(screen.getAllByTestId('thread-details-popup')).toHaveLength(2);

    fireEvent.click(screen.getAllByRole('button', { name: 'Close' })[0]);

    expect(screen.queryByTestId(`thread-details-${firstThread.uniqueId}`)).not.toBeInTheDocument();
    expect(screen.getByTestId(`thread-details-${secondThread.uniqueId}`)).toBeInTheDocument();

    unmount();

    expect(firstPopup.close).not.toHaveBeenCalled();
    expect(secondPopup.close).toHaveBeenCalledOnce();
  });
});
