import { describe, expect, it } from 'vitest';
import getCpuUsageAppearance, { getCpuUsageLozengeAppearance } from './cpuUsageAppearance';

describe('getCpuUsageAppearance', () => {
  it('maps usage ranges to the CPU Button appearances', () => {
    expect(getCpuUsageAppearance(79)).toBe('danger');
    expect(getCpuUsageAppearance(78)).toBe('warning');
    expect(getCpuUsageAppearance(43)).toBe('warning');
    expect(getCpuUsageAppearance(42)).toBe('primary');
    expect(getCpuUsageAppearance(11)).toBe('primary');
    expect(getCpuUsageAppearance(10)).toBe('default');
  });

  it('maps usage ranges to semantic Lozenge appearances', () => {
    expect(getCpuUsageLozengeAppearance(79)).toBe('danger');
    expect(getCpuUsageLozengeAppearance(78)).toBe('warning');
    expect(getCpuUsageLozengeAppearance(42)).toBe('information');
    expect(getCpuUsageLozengeAppearance(10)).toBe('neutral');
  });
});
