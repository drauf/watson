import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import MonitorsSettings from './MonitorsSettings';

vi.mock('../TimeWindow/TimeWindowFilter', () => ({ default: () => <div /> }));

describe('MonitorsSettings', () => {
  it('forwards monitor filter and regular expression changes', () => {
    const onFilterChange = vi.fn();
    const onRegExpChange = vi.fn();

    render(
      <MonitorsSettings
        withOwner={false}
        withoutIdle
        withoutOwner={false}
        nameFilter=""
        stackFilter=""
        onFilterChange={onFilterChange}
        onRegExpChange={onRegExpChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Owned locks' }));
    fireEvent.click(screen.getByRole('button', { name: 'Unowned locks' }));
    fireEvent.change(screen.getByLabelText('Thread name pattern'), { target: { value: 'http' } });

    expect(onFilterChange).toHaveBeenCalledTimes(2);
    expect(onRegExpChange).toHaveBeenCalledTimes(1);
  });
});
