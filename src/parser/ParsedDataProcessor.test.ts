import Thread from '../types/Thread';
import ThreadDump from '../types/ThreadDump';
import CpuUsage from './cpuusage/CpuUsage';
import ThreadCpuUsage from './cpuusage/ThreadCpuUsage';
import {
  findCorrespondingThreadDump,
  groupCpuUsageWithThreadDump,
  sortThreadDumps,
} from './ParsedDataProcessor';

describe('ParsedDataProcessor', () => {
  it('uses the closest absolute timestamp within the matching window', () => {
    const first = new ThreadDump(1_000);
    const second = new ThreadDump(6_000);
    const threadDumps = [first, second];
    const cpuUsage = CpuUsage.fromJfr('1970_01_01_00_00_06_thread_cpu_utilisation.txt', 0, []);

    expect(findCorrespondingThreadDump(threadDumps, cpuUsage)).toBe(second);
  });

  it('creates a dump when no timestamp is close enough', () => {
    const threadDumps = [new ThreadDump(1_000)];
    const cpuUsage = CpuUsage.fromJfr('1970_01_01_00_01_00_thread_cpu_utilisation.txt', 0, []);

    const matchingDump = findCorrespondingThreadDump(threadDumps, cpuUsage);

    expect(matchingDump.epoch).toBe(60_000);
    expect(threadDumps).toEqual([threadDumps[0], matchingDump]);
  });

  it('attaches matching CPU usage without changing unmatched threads', () => {
    const threadDump = new ThreadDump(0);
    const matchingThread = new Thread(10, 'matching');
    const unmatchedThread = new Thread(20, 'unmatched');
    threadDump.threads.push(matchingThread, unmatchedThread);
    const cpuUsage = CpuUsage.fromJfr(
      '1970_01_01_00_00_00_thread_cpu_utilisation.txt',
      3,
      [new ThreadCpuUsage(10, '1:02.03', 12.34, 0.56), new ThreadCpuUsage(30, '0:00.01', 99)],
    );

    groupCpuUsageWithThreadDump(threadDump, cpuUsage);

    expect(threadDump.runningProcesses).toBe(3);
    expect(matchingThread).toMatchObject({ cpuUsage: '12.90', hasCpuUsage: true, runningFor: '1:02.03' });
    expect(unmatchedThread).toMatchObject({ cpuUsage: '0.00', hasCpuUsage: false, runningFor: '0:00.00' });
  });

  it('sorts missing epochs before chronological dumps', () => {
    const missingEpoch = new ThreadDump(0);
    const later = new ThreadDump(2_000);
    const earlier = new ThreadDump(1_000);
    const threadDumps = [later, missingEpoch, earlier];

    sortThreadDumps(threadDumps);

    expect(threadDumps).toEqual([missingEpoch, earlier, later]);
  });
});
