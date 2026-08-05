import { render } from '@testing-library/react';
import ThreadsOverviewLegend from './ThreadsOverviewLegend';

describe('ThreadsOverviewLegend', () => {
  it('uses the shared subtle and bold status appearance classes', () => {
    const { container } = render(<ThreadsOverviewLegend />);

    expect(container.querySelectorAll('.threads-overview-status-success')).toHaveLength(2);
    expect(container.querySelectorAll('.threads-overview-status-danger')).toHaveLength(2);
    expect(container.querySelectorAll('.threads-overview-status-discovery')).toHaveLength(2);
    expect(container.querySelectorAll('.threads-overview-status-warning')).toHaveLength(2);
    expect(container.querySelectorAll('.threads-overview-status-matching')).toHaveLength(4);
  });
});
