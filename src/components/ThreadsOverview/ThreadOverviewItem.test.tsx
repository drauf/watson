import {
  fireEvent, render, screen,
} from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';
import Thread from '../../types/Thread';
import ThreadStatus from '../../types/ThreadStatus';
import ThreadsOverviewItem from './ThreadOverviewItem';

vi.mock('../common/HoverPopup', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const createThread = (): Thread => {
  const thread = new Thread(1, 'worker-1');
  thread.status = ThreadStatus.RUNNABLE;
  thread.stackTrace.push('app.Work.run');
  return thread;
};

describe('ThreadsOverviewItem', () => {
  it('renders an unknown cell without an interaction target', () => {
    render(
      <ThreadsOverviewItem
        thread={undefined}
        isMatchingStackFilter={false}
        stackPreviewLines={10}
        onOpenThreadDetails={vi.fn()}
        rowIndex={3}
        columnIndex={5}
        style={{ height: 28, width: 160 }}
      />,
    );

    expect(screen.getByRole('gridcell')).toHaveClass('unknown');
    expect(screen.getByRole('gridcell')).toHaveAttribute('aria-rowindex', '3');
    expect(screen.getByRole('gridcell')).toHaveAttribute('aria-colindex', '5');
    expect(screen.getByRole('gridcell')).not.toHaveAttribute('tabindex');
  });

  it('opens a matching thread from click and keyboard activation', () => {
    const thread = createThread();
    const onOpenThreadDetails = vi.fn();
    render(
      <ThreadsOverviewItem
        thread={thread}
        isMatchingStackFilter
        stackPreviewLines={10}
        onOpenThreadDetails={onOpenThreadDetails}
        rowIndex={2}
        columnIndex={4}
        style={{ height: 28, width: 160 }}
      />,
    );

    const cell = screen.getByRole('gridcell');
    fireEvent.click(cell);
    fireEvent.keyDown(cell, { key: ' ' });

    expect(cell).toHaveClass('threads-overview-status-success', 'threads-overview-status-matching');
    expect(cell).toHaveAttribute('tabindex', '0');
    expect(cell).toHaveAttribute('aria-rowindex', '2');
    expect(cell).toHaveAttribute('aria-colindex', '4');
    expect(onOpenThreadDetails).toHaveBeenCalledTimes(2);
    expect(onOpenThreadDetails).toHaveBeenLastCalledWith(thread);
  });
});
