import type { JSX } from 'react';
import Lock from '../../types/Lock';
import Thread from '../../types/Thread';
import ThreadDump from '../../types/ThreadDump';
import ThreadStatus from '../../types/ThreadStatus';
import Monitor from './Monitor';
import MonitorOverTime from './MonitorOverTime';
import MonitorOverTimeGroup from './MonitorOverTimeItem';

const createThread = (id: number, name: string, timestamp: number): Thread => {
  const thread = new Thread(id, name, timestamp);
  thread.status = ThreadStatus.WAITING;
  return thread;
};

const createMonitor = (epoch: number, owner: Thread | undefined, waiting: Thread[]): Monitor => {
  const threadDump = new ThreadDump(epoch);
  const lock = new Lock('0x00a1', 'java.util.concurrent.locks.ReentrantLock', owner);
  waiting.forEach((thread) => lock.addWaiting(thread));
  return new Monitor(threadDump, lock);
};

const owner = createThread(1, 'ClusterScheduler-1', Date.UTC(2026, 6, 23, 10, 0, 0));
const firstWaiting = createThread(2, 'http-nio-8080-exec-12', Date.UTC(2026, 6, 23, 10, 0, 0));
const secondWaiting = createThread(3, 'http-nio-8080-exec-18', Date.UTC(2026, 6, 23, 10, 0, 0));
const laterWaiting = createThread(4, 'http-nio-8080-exec-24', Date.UTC(2026, 6, 23, 10, 0, 5));

const monitor = new MonitorOverTime('0x00a1');
monitor.monitors.push(
  createMonitor(Date.UTC(2026, 6, 23, 10, 0, 0), owner, [firstWaiting, secondWaiting]),
  createMonitor(Date.UTC(2026, 6, 23, 10, 0, 5), undefined, [laterWaiting]),
);
monitor.waitingSum = 3;

export const OwnerAndWaiters = (): JSX.Element => (
  <MonitorOverTimeGroup monitor={monitor} />
);

export default OwnerAndWaiters;
