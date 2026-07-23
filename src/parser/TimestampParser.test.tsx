import { describe, expect, it } from 'vitest';
import { getEpochFromDateTime, tryGetEpochFromFileName } from './TimestampParser';

describe('TimestampParser', () => {
  it('parses an absolute timestamp from a thread dump file name', () => {
    expect(tryGetEpochFromFileName('2026_07_22_10_13_46.txt')).toBe(
      Date.UTC(2026, 6, 22, 10, 13, 46),
    );
  });

  it('parses an absolute timestamp from a CPU usage file name', () => {
    expect(tryGetEpochFromFileName('2026_07_22_10_13_46_thread_cpu_utilisation.txt')).toBe(
      Date.UTC(2026, 6, 22, 10, 13, 46),
    );
  });

  it('returns undefined for a file name without a timestamp', () => {
    expect(tryGetEpochFromFileName('CPU-USAGE-DUMP-1.txt')).toBeUndefined();
  });

  it('parses a date and time from thread dump content', () => {
    expect(getEpochFromDateTime('2026-07-22 10:13:46')).toBe(
      Date.UTC(2026, 6, 22, 10, 13, 46),
    );
  });
});
