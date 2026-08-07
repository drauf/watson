import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import ThreadLabelFilterButtons from './ThreadLabelFilterButtons';

const defaultLabelFilterProps = {
  http: false,
  background: false,
  indexSearch: false,
  database: false,
  userDirectory: false,
  cpuActive: false,
  includeCpuActive: false,
};

describe('ThreadLabelFilterButtons', () => {
  it('renders the five workload label filters without CPU active by default', () => {
    render(<ThreadLabelFilterButtons {...defaultLabelFilterProps} onFilterChange={vi.fn()} />);

    ['HTTP', 'Background', 'Index search', 'Database', 'User directory'].forEach((name) => {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: 'CPU active' })).not.toBeInTheDocument();
  });

  it('renders CPU active only when explicitly included', () => {
    render(<ThreadLabelFilterButtons {...defaultLabelFilterProps} includeCpuActive onFilterChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'CPU active' })).toBeInTheDocument();
  });

  it('reports the toggled filter name and checked state', () => {
    const onFilterChange = vi.fn();
    render(<ThreadLabelFilterButtons {...defaultLabelFilterProps} database onFilterChange={onFilterChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Database' }));

    expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({ name: 'database', checked: false }),
    }));
  });
});
