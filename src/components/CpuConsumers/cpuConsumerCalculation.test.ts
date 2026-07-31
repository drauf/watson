import { describe, expect, it } from 'vitest';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';
import CpuConsumersMode from './CpuConsumersMode';
import { calculateCpuConsumers } from './cpuConsumerCalculation';

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

const filters = { nameFilter: '', stackFilter: '' };

describe('calculateCpuConsumers', () => {
  it('sorts consumers by the selected summary statistic', () => {
    const dumps = [
      createDump([
        createThread(1, 'request-worker', '20.00', ['app.Request.run']),
        createThread(2, 'batch-worker', '5.00', ['app.Batch.run']),
      ]),
      createDump([
        createThread(1, 'request-worker', '10.00', ['app.Request.run']),
        createThread(2, 'batch-worker', '30.00', ['app.Batch.run']),
      ]),
    ];

    const consumers = calculateCpuConsumers(dumps, CpuConsumersMode.Max, filters);

    expect(consumers.map((consumer) => consumer.calculatedValue)).toEqual([30, 20]);
  });

  it('filters consumers by thread name and stack trace', () => {
    const consumers = calculateCpuConsumers([
      createDump([
        createThread(1, 'http-nio-8080-exec-1', '20.00', ['app.Request.run']),
        createThread(2, 'batch-worker', '30.00', ['app.Batch.run']),
      ]),
    ], CpuConsumersMode.Mean, { nameFilter: 'http.*exec', stackFilter: 'Request' });

    expect(consumers).toHaveLength(1);
    expect([...consumers[0].threadOccurrences.values()].map((thread) => thread.name)).toEqual(['http-nio-8080-exec-1']);
  });

  it('returns no consumers when filters match no threads', () => {
    const consumers = calculateCpuConsumers([
      createDump([createThread(1, 'worker', '20.00', ['app.Work.run'])]),
    ], CpuConsumersMode.Mean, { nameFilter: '^missing$', stackFilter: '' });

    expect(consumers).toEqual([]);
  });
});
