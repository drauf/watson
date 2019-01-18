import Thread from '../types/Thread';
import ThreadDump from '../types/ThreadDump';

export default class ThreadDumpsUtils {
  public static getThreadsOverTime(threadDumps: ThreadDump[]): Array<Map<number, Thread>> {
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

    return ThreadDumpsUtils.sortByName(Array.from(threadsOverTime.values()));
  }

  private static sortByName(threads: Array<Map<number, Thread>>): Array<Map<number, Thread>> {
    return threads.sort((t1, t2) => {
      return this.getThreadName(t1).localeCompare(this.getThreadName(t2));
    });
  }

  private static getThreadName(threads: Map<number, Thread>): string {
    for (const [, thread] of threads) {
      if (thread) {
        return thread.name;
      }
    }
    return '';
  }
}
