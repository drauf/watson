import Thread from '../types/Thread';
import ThreadDump from '../types/ThreadDump';

const getThreadName = (threads: Map<number, Thread>): string => {
  const firstThread = Array.from(threads.values()).find((thread) => (thread));
  return firstThread ? firstThread.name : '';
};

export default function getThreadsOverTime(threadDumps: ThreadDump[]): Array<Map<number, Thread>> {
  const threadsOverTime = new Map<number, Map<number, Thread>>();

  threadDumps.forEach((threadDump, dumpNumber) => {
    threadDump.threads.forEach((thread) => {
      let threadOccurences = threadsOverTime.get(thread.id);
      if (!threadOccurences) {
        threadOccurences = new Map<number, Thread>();
      }

      threadOccurences.set(dumpNumber, thread);
      threadsOverTime.set(thread.id, threadOccurences);
    });
  });

  return Array.from(threadsOverTime.values())
    .sort((t1, t2) => getThreadName(t1).localeCompare(getThreadName(t2)));
}
