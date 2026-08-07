import { fireEvent, render, screen } from '@testing-library/react';
import {
  describe, expect, it, vi,
} from 'vitest';
import FlameGraphSettings from './FlameGraphSettings';

vi.mock('../TimeWindow/TimeWindowFilter', () => ({ default: () => <div data-testid="time-window" /> }));

describe('FlameGraphSettings', () => {
  it('forwards filter and regular expression changes', () => {
    const onFilterChange = vi.fn();
    const onRegExpChange = vi.fn();

    render(
      <FlameGraphSettings
        withoutIdle
        usingCpu={false}
        nameFilter=""
        stackFilter=""
        onFilterChange={onFilterChange}
        onRegExpChange={onRegExpChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /^CPU active$/ }));
    fireEvent.change(screen.getByLabelText('Stack trace pattern'), { target: { value: 'Request' } });

    expect(onFilterChange).toHaveBeenCalledTimes(1);
    expect(onRegExpChange).toHaveBeenCalledTimes(1);
  });
});
