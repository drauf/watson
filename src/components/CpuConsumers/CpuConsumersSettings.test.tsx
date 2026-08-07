import { fireEvent, render, screen } from '@testing-library/react';
import {
  describe, expect, it, vi,
} from 'vitest';
import CpuConsumersMode from './CpuConsumersMode';
import CpuConsumersSettings from './CpuConsumersSettings';

describe('CpuConsumersSettings', () => {
  it('forwards sort and regular expression changes', () => {
    const onModeChange = vi.fn();
    const onRegExpChange = vi.fn();

    render(
      <CpuConsumersSettings
        mode={CpuConsumersMode.Mean}
        nameFilter=""
        stackFilter=""
        http={false}
        background={false}
        indexSearch={false}
        database={false}
        userDirectory={false}
        cpuActive={false}
        onModeChange={onModeChange}
        onFilterChange={vi.fn()}
        onRegExpChange={onRegExpChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /^Median$/ }));
    fireEvent.change(screen.getByLabelText('Thread name pattern'), { target: { value: 'http.*exec' } });

    expect(onModeChange).toHaveBeenCalledWith(CpuConsumersMode.Median);
    expect(onRegExpChange).toHaveBeenCalledTimes(1);
  });
});
