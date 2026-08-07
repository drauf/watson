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
        nameFilter=""
        stackFilter=""
        http={false}
        background={false}
        indexSearch={false}
        database={false}
        userDirectory={false}
        cpuActive={false}
        onFilterChange={onFilterChange}
        onRegExpChange={onRegExpChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /^CPU active$/ }));
    fireEvent.change(screen.getByLabelText('Stack trace pattern'), { target: { value: 'Request' } });

    expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({ name: 'cpuActive', checked: true }),
    }));
    expect(onRegExpChange).toHaveBeenCalledTimes(1);
  });
});
