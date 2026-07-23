import { describe, it, expect } from 'vitest';
import TopCpuUsageParser from './TopCpuUsageParser';
import CpuUsage from '../CpuUsage';
import MemoryUnit from '../../../types/MemoryUnit';

const HEADER = [
  'top - 01:13:20 up  2:56,  0 users,  load average: 1.58, 1.84, 1.86',
  'Threads: 482 total,   1 running, 481 sleeping,   0 stopped,   0 zombie',
  '%Cpu(s):  4.1 us,  0.7 sy,  0.0 ni, 94.9 id,  0.0 wa,  0.0 hi,  0.3 si,  0.0 st',
];

const PROCESS_ROWS = [
  '',
  '  PID USER      PR  NI    VIRT    RES    SHR S %CPU %MEM     TIME+ COMMAND',
  '15365 jira      20   0  109.6g  27.3g   2.3g R 99.9 39.7 144:51.95 CHANGE_HIST+',
];

const parse = (memLine: string, swapLine: string): CpuUsage => {
  let result: CpuUsage | undefined;
  TopCpuUsageParser.parseCpuUsage(
    [...HEADER, memLine, swapLine, ...PROCESS_ROWS],
    (cpuUsage) => { result = cpuUsage; },
  );
  return result as CpuUsage;
};

describe('TopCpuUsageParser', () => {
  it('parses the legacy per-value k-suffix format as KiB', () => {
    const cpuUsage = parse(
      'Mem:  65846052k total, 57542808k used,  8303244k free,  1200960k buffers',
      'Swap:  2097148k total,        0k used,  2097148k free, 23876776k cached',
    );

    const memory = cpuUsage.memoryUsage;
    expect(memory?.memoryUnit).toBe(MemoryUnit.KiB);
    expect(memory?.memoryTotal).toBe(65846052);
    expect(memory?.memoryUsed).toBe(57542808);
    expect(memory?.memoryFree).toBe(8303244);
    expect(memory?.swapTotal).toBe(2097148);
    expect(memory?.swapFree).toBe(2097148);
  });

  it('parses the modern KiB header prefix', () => {
    const cpuUsage = parse(
      'KiB Mem : 72028848 total,   601532 free, 27371536 used, 44055780 buff/cache',
      'KiB Swap:        0 total,        0 free,        0 used. 44042408 avail Mem',
    );

    expect(cpuUsage.memoryUsage?.memoryUnit).toBe(MemoryUnit.KiB);
    expect(cpuUsage.memoryUsage?.memoryTotal).toBe(72028848);
    expect(cpuUsage.memoryUsage?.memoryUsed).toBe(27371536);
    expect(cpuUsage.memoryUsage?.memoryFree).toBe(601532);
  });

  it('parses the MiB header prefix', () => {
    const cpuUsage = parse(
      'MiB Mem :  63912 total,   8104 free,  55808 used,   1024 buff/cache',
      'MiB Swap:   2048 total,   2048 free,      0 used.   7000 avail Mem',
    );

    expect(cpuUsage.memoryUsage?.memoryUnit).toBe(MemoryUnit.MiB);
    expect(cpuUsage.memoryUsage?.memoryTotal).toBe(63912);
    expect(cpuUsage.memoryUsage?.swapTotal).toBe(2048);
  });

  it('parses the GiB header prefix', () => {
    const cpuUsage = parse(
      'GiB Mem :    124 total,     16 free,    100 used,      8 buff/cache',
      'GiB Swap:      2 total,      2 free,      0 used.     20 avail Mem',
    );

    expect(cpuUsage.memoryUsage?.memoryUnit).toBe(MemoryUnit.GiB);
    expect(cpuUsage.memoryUsage?.memoryTotal).toBe(124);
    expect(cpuUsage.memoryUsage?.swapTotal).toBe(2);
  });

  it('parses the TiB header prefix', () => {
    const cpuUsage = parse(
      'TiB Mem :      3 total,      1 free,      2 used,      0 buff/cache',
      'TiB Swap:      1 total,      1 free,      0 used.      2 avail Mem',
    );

    expect(cpuUsage.memoryUsage?.memoryUnit).toBe(MemoryUnit.TiB);
    expect(cpuUsage.memoryUsage?.memoryTotal).toBe(3);
    expect(cpuUsage.memoryUsage?.memoryUsed).toBe(2);
  });

  it('parses load averages, running processes and thread rows alongside memory', () => {
    const cpuUsage = parse(
      'KiB Mem : 72028848 total,   601532 free, 27371536 used, 44055780 buff/cache',
      'KiB Swap:        0 total,        0 free,        0 used. 44042408 avail Mem',
    );

    expect(cpuUsage.timestampKind).toBe('time-of-day');
    expect(cpuUsage.epoch).toBe(4400000);
    expect(cpuUsage.runningProcesses).toBe(1);
    expect(cpuUsage.loadAverages?.oneMinute).toBe(1.58);
    expect(cpuUsage.loadAverages?.fiveMinutes).toBe(1.84);
    expect(cpuUsage.loadAverages?.fifteenMinutes).toBe(1.86);

    const threads = cpuUsage.getThreadCpuUsages();
    expect(threads).toHaveLength(1);
    expect(threads[0].id).toBe(15365);
    expect(threads[0].getCpuUsage()).toBe('99.90');
    expect(threads[0].runningFor).toBe('144:51.95');
  });
});
