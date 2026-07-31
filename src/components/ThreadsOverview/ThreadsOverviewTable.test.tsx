import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Thread from '../../types/Thread';
import ThreadStatus from '../../types/ThreadStatus';
import ThreadsOverviewTable from './ThreadsOverviewTable';

vi.mock('../ThreadDetails/useOpenThreadDetails', () => ({
  default: () => ({ open: vi.fn(), WindowComponent: null }),
}));

const createThread = (id: number, name: string, stackTrace: string[]): Thread => {
  const thread = new Thread(id, name);
  thread.status = ThreadStatus.RUNNABLE;
  thread.stackTrace.push(...stackTrace);
  return thread;
};

describe('ThreadsOverviewTable', () => {
  it('uses a fixed name column and a configured minimum table width', () => {
    const thread = createThread(1, 'http-nio-8080-exec-1', ['app.Request.handle']);

    const { container } = render(
      <ThreadsOverviewTable
        dates={['10:00:00', '10:00:05', '10:00:10']}
        threadDumps={[
          new Map([
            [0, thread],
            [1, createThread(2, 'http-nio-8080-exec-1', ['app.Request.handle'])],
            [2, createThread(3, 'http-nio-8080-exec-1', ['app.Request.handle'])],
          ]),
        ]}
        matchingStackFilter={new Set()}
        dumpColumnWidth={160}
        stackPreviewLines={10}
      />,
    );

    expect(container.querySelector('.threads-overview-name-column')).toHaveStyle({ width: '240px' });
    expect(container.querySelector('.threads-overview-table')).toHaveStyle({ minWidth: '720px' });
    expect(screen.getByText('http-nio-8080-exec-1')).toBeInTheDocument();
  });

  it('uses fit-columns mode when the configured minimum width is zero', () => {
    const thread = createThread(1, 'worker-1', ['app.Work.run']);

    const { container } = render(
      <ThreadsOverviewTable
        dates={['10:00:00', '10:00:05']}
        threadDumps={[
          new Map([
            [0, thread],
            [1, createThread(2, 'worker-1', ['app.Work.run'])],
          ]),
        ]}
        matchingStackFilter={new Set([thread.uniqueId])}
        dumpColumnWidth={0}
        stackPreviewLines={1}
      />,
    );

    expect(container.querySelector('.threads-overview-table')).toHaveClass('threads-overview-table-fit-columns');
    expect(container.querySelector('.threads-overview-table')).not.toHaveStyle({ minWidth: '560px' });
  });
});
