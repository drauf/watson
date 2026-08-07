import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import StuckThreadsSettings from './StuckThreadsSettings';

vi.mock('../TimeWindow/TimeWindowFilter', () => ({ default: () => <div /> }));

describe('StuckThreadsSettings', () => {
  it('forwards filter, regex, and numeric setting changes', () => {
    const onFilterChange = vi.fn();
    const onIntegerChange = vi.fn();
    const onRegExpChange = vi.fn();

    render(
      <StuckThreadsSettings
        maxDifferingLines={5}
        minClusterSize={10}
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
    fireEvent.change(screen.getByLabelText('Detection threshold'), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText('Similarity tolerance'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Stack trace pattern'), { target: { value: 'latch' } });

    expect(onFilterChange).toHaveBeenCalledTimes(1);
    expect(onIntegerChange).toHaveBeenCalledTimes(2);
    expect(onRegExpChange).toHaveBeenCalledTimes(1);
  });
});
