import { describe, expect, it } from 'vitest';
import LoadAverages from '../../types/LoadAverage';
import MemoryUnit from '../../types/MemoryUnit';
import MemoryUsage from '../../types/MemoryUsage';
import CpuUsage from './CpuUsage';

describe('CpuUsage', () => {
  it('uses an absolute timestamp for JFR CPU usage files', () => {
    const cpuUsage = CpuUsage.fromJfr(
      '2026_07_22_10_13_46_thread_cpu_utilisation.txt',
      0,
      [],
    );

    expect(cpuUsage.timestampKind).toBe('absolute');
    expect(cpuUsage.epoch).toBe(Date.UTC(2026, 6, 22, 10, 13, 46));
  });

  it('uses a time-of-day timestamp for top output', () => {
    const cpuUsage = CpuUsage.fromTop(
      '09:50:49',
      0,
      [],
      new LoadAverages(0, 0, 0),
      new MemoryUsage(0, 0, 0, 0, 0, 0, MemoryUnit.KiB),
    );

    expect(cpuUsage.timestampKind).toBe('time-of-day');
    expect(cpuUsage.epoch).toBe(35449000);
  });
});
