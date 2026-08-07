import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import SimilarStacksSettings from './SimilarStacksSettings';

vi.mock('../TimeWindow/TimeWindowFilter', () => ({ default: () => <div /> }));

describe('SimilarStacksSettings', () => {
  it('forwards filter, regex, and numeric setting changes', () => {
    const onFilterChange = vi.fn();
    const onIntegerChange = vi.fn();
    const onRegExpChange = vi.fn();

    render(
      <SimilarStacksSettings
        linesToConsider={30}
        minimumGroupSize={5}
        withoutIdle
        nameFilter=""
        stackFilter=""
        http={false}
        background={false}
        indexSearch={false}
        database={false}
        userDirectory={false}
        cpuActive={false}
        onFilterChange={onFilterChange}
        onIntegerChange={onIntegerChange}
        onRegExpChange={onRegExpChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Active' }));
    fireEvent.change(screen.getByLabelText('Comparison depth'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Minimum group size'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('Thread name pattern'), { target: { value: 'http' } });

    expect(onFilterChange).toHaveBeenCalledTimes(1);
    expect(onIntegerChange).toHaveBeenCalledTimes(2);
    expect(onRegExpChange).toHaveBeenCalledTimes(1);
  });
});
