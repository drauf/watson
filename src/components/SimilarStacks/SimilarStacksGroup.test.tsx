import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Thread from '../../types/Thread';
import ThreadStatus from '../../types/ThreadStatus';
import { ThreadLabel } from '../../common/threadLabels';
import SimilarStacksGroup from './SimilarStacksGroup';

vi.mock('./GroupDetails', () => ({
  default: () => null,
}));

const createThread = (name: string, labels: ThreadLabel[]): Thread => {
  const thread = new Thread(1, name);
  thread.status = ThreadStatus.RUNNABLE;
  thread.stackTrace.push('app.Work.run');
  thread.labels = labels;
  return thread;
};

describe('SimilarStacksGroup', () => {
  it('renders shared labels in the group header', () => {
    render(
      <SimilarStacksGroup
        linesToConsider={10}
        threadGroup={[
          createThread('http-nio-8080-exec-1', [ThreadLabel.HTTP, ThreadLabel.INDEX_SEARCH]),
          createThread('http-nio-8080-exec-2', [ThreadLabel.HTTP, ThreadLabel.CPU_ACTIVE]),
        ]}
      />,
    );

    expect(screen.getByText('HTTP')).toBeInTheDocument();
    expect(screen.getByText('Index search')).toBeInTheDocument();
    expect(screen.getByText('CPU active')).toBeInTheDocument();
  });
});
