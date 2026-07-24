import {
  beforeEach, describe, expect, it, vi,
} from 'vitest';
import AsyncParser from './AsyncParser';
import ThreadDump from '../types/ThreadDump';

const createFile = (name: string, contents: string): File => new File([contents], name, { type: 'text/plain' });

describe('AsyncParser JFR CPU integration', () => {
  const onFilesParsed = vi.fn();

  beforeEach(() => {
    onFilesParsed.mockClear();
  });

  it('attaches JFR CPU usage to the matching thread dump', async () => {
    const parser = new AsyncParser(onFilesParsed);
    const threadDump = createFile(
      '2026_07_21_11_38_03.txt',
      [
        '2026-07-21 11:38:03',
        '"Thread-1" #1 prio=5 os_prio=0 cpu=1.00ms elapsed=1.00s tid=0x0000000000000001 nid=3315 runnable',
        '   java.lang.Thread.State: RUNNABLE',
        '',
      ].join('\n'),
    );
    const cpuUsage = createFile(
      '2026_07_21_11_38_06_thread_cpu_utilisation.txt',
      [
        'JVM_THREAD_ID OS_THREAD_ID %CPU_USER_MODE %CPU_SYSTEM_MODE SYSTEM_TIME THREAD_NAME',
        '486 3315 24.84% 0.05% 16:39.04 Thread-1',
      ].join('\n'),
    );

    await parser.parseFiles([threadDump, cpuUsage]);

    const parsedThreadDumps = onFilesParsed.mock.calls[0][0] as ThreadDump[];
    expect(parsedThreadDumps).toHaveLength(1);
    expect(parsedThreadDumps[0].threads).toContainEqual(expect.objectContaining({
      id: 3315,
      cpuUsage: '24.89',
      runningFor: '16:39.04',
    }));
  });
});
