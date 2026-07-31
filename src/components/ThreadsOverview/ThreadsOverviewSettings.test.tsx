import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import ThreadsOverviewSettings from './ThreadsOverviewSettings';

vi.mock('../TimeWindow/TimeWindowFilter', () => ({
  default: () => <div data-testid="time-window-filter" />,
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
      tomcat={false}
      nonTomcat={false}
      database={false}
      lucene={false}
      usingCpu={false}
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

  it('forwards table display setting changes', () => {
    const { onColumnWidthChange, onStackPreviewLinesChange } = renderSettings();

    fireEvent.change(screen.getByLabelText('Table column width'), { target: { value: '0', valueAsNumber: 0 } });
    fireEvent.change(screen.getByLabelText('Stack preview lines'), { target: { value: '12', valueAsNumber: 12 } });

    expect(onColumnWidthChange).toHaveBeenCalledTimes(1);
    expect(onStackPreviewLinesChange).toHaveBeenCalledTimes(1);
  });
});
