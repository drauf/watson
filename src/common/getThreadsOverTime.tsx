import Thread from '../types/Thread';
import ThreadDump from '../types/ThreadDump';

const getFirstThread = (threads: Map<number, Thread>): Thread | undefined => threads.values().next().value;

const getThreadName = (threads: Map<number, Thread>): string => getFirstThread(threads)?.name || '';

const getThreadId = (threads: Map<number, Thread>): number => getFirstThread(threads)?.id || 0;

export default function getThreadsOverTime(threadDumps: ThreadDump[]): Map<number, Thread>[] {
  const threadsOverTime = new Map<number, Map<number, Thread>>();

  threadDumps.forEach((threadDump, dumpNumber) => {
    threadDump.threads.forEach((thread) => {
      let threadOccurrences = threadsOverTime.get(thread.id);
      if (!threadOccurrences) {
        threadOccurrences = new Map<number, Thread>();
      }

      threadOccurrences.set(dumpNumber, thread);
      threadsOverTime.set(thread.id, threadOccurrences);
    });
  });

  return Array.from(threadsOverTime.values())
    .sort((first, second) => getThreadName(first).localeCompare(getThreadName(second)) || getThreadId(first) - getThreadId(second));
}
