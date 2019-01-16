import Thread from '../types/Thread';
import ThreadDump from '../types/ThreadDump';

export default class ThreadDumpsUtils {
  public static getThreadsOverTime(threadDumps: ThreadDump[]): Map<number, Map<number, Thread>> {
    const threadsOverTime = new Map();

    threadDumps.forEach((threadDump, dumpNumber) => {
      threadDump.threads.forEach((thread) => {
        let threadOccurences = threadsOverTime.get(thread.id);
        if (!threadOccurences) {
          threadOccurences = new Map();
        }

        threadOccurences.set(dumpNumber, thread);
        threadsOverTime.set(thread.id, threadOccurences);
      });
    });

    return threadsOverTime;
  }
}
