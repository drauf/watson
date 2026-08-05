import {
  fireEvent, render, screen,
} from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';
import type Thread from '../../types/Thread';
import { openThreadDetailsPopup } from '../ThreadDetails/useOpenThreadDetails';
import ThreadsOverviewTable from './ThreadsOverviewTable';

vi.mock('./ThreadsOverviewVirtualGrid', () => ({
  default: ({ onOpenThreadDetails }: { onOpenThreadDetails: (thread: Thread) => void }) => (
    <button
      type="button"
      onClick={() => onOpenThreadDetails({ uniqueId: 1, name: 'worker-1' } as Thread)}
    >
      Open details
    </button>
  ),
}));

vi.mock('../ThreadDetails/ThreadDetailsPopup', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="thread-details-popup">{children}</div>,
}));

vi.mock('../ThreadDetails/ThreadDetailsWindow', () => ({
  default: ({ thread }: { thread: Thread }) => <div data-testid={`thread-details-${thread.uniqueId}`}>{thread.name}</div>,
}));

vi.mock('../ThreadDetails/useOpenThreadDetails', () => ({
  openThreadDetailsPopup: vi.fn(),
}));

const renderTable = () => render(
  <ThreadsOverviewTable
    dates={[]}
    rows={[]}
    matchingStackFilter={new Set()}
    dumpColumnWidth={160}
    stackPreviewLines={10}
    getScrollElement={() => document.documentElement}
  />,
);

describe('ThreadsOverviewTable', () => {
  beforeEach(() => vi.mocked(openThreadDetailsPopup).mockReset());

  it('renders the detail popup portal requested by the virtual grid', () => {
    const popup = { closed: false, close: vi.fn(), focus: vi.fn() } as unknown as Window;
    vi.mocked(openThreadDetailsPopup).mockReturnValue({ popup, container: document.createElement('div') });

    renderTable();
    fireEvent.click(screen.getByRole('button', { name: 'Open details' }));

    expect(openThreadDetailsPopup).toHaveBeenCalledWith(expect.objectContaining({ name: 'worker-1' }));
    expect(screen.getByTestId('thread-details-1')).toHaveTextContent('worker-1');
  });
});
