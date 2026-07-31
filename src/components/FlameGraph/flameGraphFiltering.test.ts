import { describe, expect, it } from 'vitest';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';
import { filterFlameGraphThreads } from './flameGraphFiltering';

const createThread = (id: number, name: string, cpuUsage: string, stackTrace: string[]): Thread => {
  const thread = new Thread(id, name);
  thread.cpuUsage = cpuUsage;
  thread.stackTrace.push(...stackTrace);
  return thread;
};

const createDump = (threads: Thread[]): ThreadDump => {
  const dump = new ThreadDump(Date.now());
  dump.threads.push(...threads);
  return dump;
};

const filters = {
  withoutIdle: false,
  usingCpu: false,
  nameFilter: '',
  stackFilter: '',
};

describe('filterFlameGraphThreads', () => {
  it('filters by CPU usage, thread name, and stack trace', () => {
    const threadDumps = [createDump([
      createThread(1, 'http-nio-8080-exec-1', '15.00', ['app.Request.run']),
      createThread(2, 'batch-worker', '5.00', ['app.Batch.run']),
    ])];

    const threads = filterFlameGraphThreads(threadDumps, {
      ...filters,
      usingCpu: true,
      nameFilter: 'http.*exec',
      stackFilter: 'Request',
    });

    expect(threads.map((thread) => thread.name)).toEqual(['http-nio-8080-exec-1']);
  });

  it('returns no threads when a regular expression matches nothing', () => {
    const threads = filterFlameGraphThreads([createDump([
      createThread(1, 'worker', '20.00', ['app.Work.run']),
    ])], { ...filters, nameFilter: '^missing$' });

    expect(threads).toEqual([]);
  });
});
