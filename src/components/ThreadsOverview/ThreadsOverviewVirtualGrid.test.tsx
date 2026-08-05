import {
  fireEvent, render, screen,
} from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';
import Thread from '../../types/Thread';
import ThreadStatus from '../../types/ThreadStatus';
import ThreadsOverviewVirtualGrid from './ThreadsOverviewVirtualGrid';
import type { ThreadOverviewDataRow } from './threadsOverviewRows';

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: vi.fn(({
    count,
    estimateSize,
    getItemKey,
  }: {
    count: number;
    estimateSize: (index: number) => number;
    getItemKey?: (index: number) => string | number;
  }) => {
    const sizes = Array.from({ length: count }, (_unused, index) => estimateSize(index));
    return {
      getVirtualItems: () => sizes.map((size, index) => ({
        index,
        key: getItemKey ? getItemKey(index) : index,
        start: sizes.slice(0, index).reduce((total, currentSize) => total + currentSize, 0),
        size,
      })),
      getTotalSize: () => sizes.reduce((total, size) => total + size, 0),
      measure: vi.fn(),
    };
  }),
}));

vi.mock('../common/HoverPopup', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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

const grid = (
  rows: ThreadOverviewDataRow[],
  onOpenThreadDetails = vi.fn(),
  dumpColumnWidth = 160,
  getScrollElement = () => document.documentElement,
) => (
  <ThreadsOverviewVirtualGrid
    dates={['10:00:00', '10:00:05', '10:00:10']}
    rows={rows}
    matchingStackFilter={new Set()}
    dumpColumnWidth={dumpColumnWidth}
    stackPreviewLines={10}
    getScrollElement={getScrollElement}
    onOpenThreadDetails={onOpenThreadDetails}
  />
);

describe('ThreadsOverviewVirtualGrid', () => {
  it('renders frozen panes and configured minimum dump widths', () => {
    const thread = createThread(1, 'http-nio-8080-exec-1', ['app.Request.handle']);
    const { container } = render(grid([
      createRow(thread, new Map([
        [0, thread],
        [1, createThread(2, thread.name, ['app.Request.handle'])],
        [2, createThread(3, thread.name, ['app.Request.handle'])],
      ])),
    ]));

    expect(screen.getByRole('grid')).toHaveAttribute('aria-colcount', '4');
    expect(container.querySelector('.threads-overview-grid-corner')).toHaveTextContent('Thread Name / Time');
    expect(screen.getByRole('grid')).toHaveAttribute(
      'style',
      expect.stringContaining('--threads-overview-grid-data-width: 480px'),
    );
    expect(screen.getByText(thread.name)).toBeInTheDocument();
  });

  it('uses the readable minimum width in fit-columns mode', () => {
    const thread = createThread(1, 'worker-1', ['app.Work.run']);
    render(grid([createRow(thread)], vi.fn(), 0));

    expect(screen.getByRole('grid')).toHaveAttribute(
      'style',
      expect.stringContaining('--threads-overview-grid-data-width: 144px'),
    );
  });

  it('opens a thread from keyboard activation', () => {
    const thread = createThread(1, 'worker-1', ['first.frame']);
    const onOpenThreadDetails = vi.fn();
    render(grid([createRow(thread)], onOpenThreadDetails));

    fireEvent.keyDown(screen.getByText('first.frame'), { key: 'Enter' });

    expect(onOpenThreadDetails).toHaveBeenCalledWith(thread);
  });
});
