import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { vi } from 'vitest';
import ThreadsOverviewSettings from './ThreadsOverviewSettings';

vi.mock('../TimeWindow/TimeWindowFilter', () => ({
  default: () => <div data-testid="time-window-filter" />,
}));

vi.mock('../common/HoverPopup', () => ({
  default: ({ children, content }: { children: ReactNode; content?: ReactNode }) => (
    <>
      {children}
      {content && <div>{content}</div>}
    </>
  ),
}));

const renderSettings = () => {
  const onFilterChange = vi.fn();
  const onRegExpChange = vi.fn();
  const onColumnWidthChange = vi.fn();
  const onStackPreviewLinesChange = vi.fn();

  render(
    <ThreadsOverviewSettings
      active
      nonJvm
      http={false}
      background={false}
      database={false}
      indexSearch={false}
      userDirectory={false}
      cpuActive={false}
      nameFilter=""
      stackFilter=""
      dumpColumnWidth={160}
      stackPreviewLines={10}
      onFilterChange={onFilterChange}
      onRegExpChange={onRegExpChange}
      onColumnWidthChange={onColumnWidthChange}
      onStackPreviewLinesChange={onStackPreviewLinesChange}
    />,
  );

  return {
    onColumnWidthChange,
    onFilterChange,
    onRegExpChange,
    onStackPreviewLinesChange,
  };
};

describe('ThreadsOverviewSettings', () => {
  it('forwards filter and regular expression changes', () => {
    const { onFilterChange, onRegExpChange } = renderSettings();

    fireEvent.click(screen.getByRole('button', { name: 'Active' }));
    fireEvent.change(screen.getByLabelText('Thread name pattern'), { target: { value: '^http' } });
    fireEvent.change(screen.getByLabelText('Stack trace pattern'), { target: { value: 'lucene' } });

    expect(onFilterChange).toHaveBeenCalledTimes(1);
    expect(onRegExpChange).toHaveBeenCalledTimes(2);
  });

  it('renders semantic workload filters with explanatory tooltips', () => {
    const { onFilterChange } = renderSettings();

    expect(screen.getByRole('button', { name: 'HTTP' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Background' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Index search' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'User directory' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'CPU active' })).toBeInTheDocument();
    expect(screen.getByText('Show HTTP request-processing threads, including browser and REST API actions')).toBeInTheDocument();
    expect(screen.getByText('Show non-HTTP background threads, such as schedulers and internal workers')).toBeInTheDocument();
    expect(screen.getByText('Show threads performing database queries and operations')).toBeInTheDocument();
    expect(screen.getByText('Show threads performing Lucene or OpenSearch indexing and queries')).toBeInTheDocument();
    expect(screen.getByText('Show threads calling Atlassian Embedded Crowd for user and group directory lookups')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Index search' }));
    fireEvent.click(screen.getByRole('button', { name: 'User directory' }));

    expect(onFilterChange).toHaveBeenCalledTimes(2);
  });

  it('forwards table display setting changes', () => {
    const { onColumnWidthChange, onStackPreviewLinesChange } = renderSettings();

    fireEvent.change(screen.getByLabelText('Table column width'), { target: { value: '0', valueAsNumber: 0 } });
    fireEvent.change(screen.getByLabelText('Stack preview lines'), { target: { value: '12', valueAsNumber: 12 } });

    expect(onColumnWidthChange).toHaveBeenCalledTimes(1);
    expect(onStackPreviewLinesChange).toHaveBeenCalledTimes(1);
  });
});
