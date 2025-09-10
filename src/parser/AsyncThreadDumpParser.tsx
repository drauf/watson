import Lock from '../types/Lock';
import Thread from '../types/Thread';
import ThreadDump from '../types/ThreadDump';
import ThreadStatus from '../types/ThreadStatus';
import { matchMultipleGroups, matchOne } from './RegExpUtils';
import { PerformanceConfig, DEFAULT_PERFORMANCE_CONFIG } from './PerformanceConfig';

const THREAD_HEADER_PREFIX = '"';

export const THREAD_DUMP_DATE_PATTERN = /^([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2})\r?$/;
const NAME_PATTERN = /^"(.*)" /;
const NID_PATTERN = / nid=([0-9a-fx,]+)/;
const TID_PATTERN = / tid=([0-9a-fx,]+)/;
const FRAME_PATTERN = /^\s+at (.*)/;
const THREAD_STATE_PATTERN = /^\s*java.lang.Thread.State: (.*)/;
const SYNCHRONIZATION_STATUS_PATTERN = /^\s+- (.*?) +<([x0-9a-f]+)> \(a (.*)\)/;
const HELD_LOCK_PATTERN = /^\s+- <([x0-9a-f]+)> \(a (.*)\)/;

export type ParseThreadDumpCallback = (threadDump: ThreadDump) => void;
export type ProgressCallback = (processed: number, total: number) => void;

export default class AsyncThreadDumpParser {
  public static async parseThreadDump(
    lines: string[],
    callback: ParseThreadDumpCallback,
    progressCallback?: ProgressCallback,
    config: PerformanceConfig = DEFAULT_PERFORMANCE_CONFIG,
  ): Promise<void> {
    const threadDump = ThreadDump.from(matchOne(THREAD_DUMP_DATE_PATTERN, lines.shift() as string));
    let currentThread: Thread | null = null;

    // Process lines in chunks to avoid blocking the UI
    // eslint-disable-next-line no-await-in-loop
    for (let i = 0; i < lines.length; i += config.threadDumpChunkSize) {
      const chunk = lines.slice(i, i + config.threadDumpChunkSize);

      for (const line of chunk) {
        currentThread = AsyncThreadDumpParser.parseLine(line, threadDump, currentThread);
      }

      // Report progress and yield control to the browser
      if (progressCallback) {
        progressCallback(Math.min(i + config.threadDumpChunkSize, lines.length), lines.length);
      }
      // eslint-disable-next-line no-await-in-loop
      await AsyncThreadDumpParser.delay(config.threadDumpProcessingDelay);
    }

    AsyncThreadDumpParser.identifyAnonymousSynchronizers(threadDump.threads);
    callback(threadDump);
  }

  private static parseLine(line: string, threadDump: ThreadDump, currentThread: Thread | null): Thread | null {
    if (line.startsWith(THREAD_HEADER_PREFIX)) {
      return AsyncThreadDumpParser.parseThreadHeader(line, threadDump);
    }
    if (line && currentThread) {
      AsyncThreadDumpParser.parseStackLine(line, threadDump, currentThread);
    }
    return currentThread;
  }

  private static parseThreadHeader(header: string, threadDump: ThreadDump): Thread {
    const name = matchOne(NAME_PATTERN, header).trim();
    // Depending on the way thread dumps were made, they can either have NID or TID
    // We prefer NID, as it allows linking thread dumps with cpu_usage files
    const nid = parseInt(matchOne(NID_PATTERN, header), 16);
    const tid = parseInt(matchOne(TID_PATTERN, header), 16);
    const id = nid !== 0 ? nid : tid;

    const currentThread = new Thread(id, name, threadDump.epoch);
    threadDump.threads.push(currentThread);
    return currentThread;
  }

  private static parseStackLine(line: string, threadDump: ThreadDump, currentThread: Thread): void {
    const frame: string = matchOne(FRAME_PATTERN, line);
    if (frame) {
      currentThread.stackTrace.push(frame);
      return;
    }

    const threadState: string = matchOne(THREAD_STATE_PATTERN, line);
    if (threadState) {
      // eslint-disable-next-line no-param-reassign
      currentThread.status = AsyncThreadDumpParser.stringToThreadStatus(threadState);
      return;
    }

    const synchronizationStatus = matchMultipleGroups(SYNCHRONIZATION_STATUS_PATTERN, line);
    if (synchronizationStatus && synchronizationStatus.length === 3) {
      const state: string = synchronizationStatus[0];
      const lockId: string = synchronizationStatus[1];
      const className: string = synchronizationStatus[2];

      let lock: Lock;
      switch (state) {
        case 'waiting on':
        case 'parking to wait for':
        case 'waiting to lock':
        case 'waiting to re-lock in wait()':
          lock = AsyncThreadDumpParser.getOrCreateLock(threadDump.locks, lockId, className);
          lock.addWaiting(currentThread);
          // eslint-disable-next-line no-param-reassign
          currentThread.lockWaitingFor = lock;
          return;

        case 'locked':
          if (currentThread.lockWaitingFor
            && currentThread.lockWaitingFor.id === lockId) {
            // lock is released while waiting for the notification
            return;
          }
          lock = AsyncThreadDumpParser.getOrCreateLock(threadDump.locks, lockId, className, currentThread);
          currentThread.locksHeld.push(lock);
          currentThread.classicalLocksHeld.push(lock);
          return;

        case 'eliminated':
          // redundant lock that has been removed in the bytecode - we don't care about those
          return;

        default:
          console.warn(`Unknown synchronziation status: ${line}`);
          return;
      }
    }

    const lockHeld: string[] = matchMultipleGroups(HELD_LOCK_PATTERN, line);
    if (lockHeld && lockHeld.length === 2) {
      const lockId: string = lockHeld[0];
      const className: string = lockHeld[1];

      const lock: Lock = AsyncThreadDumpParser.getOrCreateLock(threadDump.locks, lockId, className, currentThread);
      currentThread.locksHeld.push(lock);
    }
  }

  private static identifyAnonymousSynchronizers(threads: Thread[]): void {
    // sometimes threads wait for notification, but the thread dump doesn't say on which object
    // this function guesses it's the last hit classical lock
    const validStatuses = [ThreadStatus.BLOCKED, ThreadStatus.TIMED_WAITING, ThreadStatus.WAITING];

    threads
      .filter((thread) => !thread.lockWaitingFor)
      .filter((thread) => validStatuses.includes(thread.status))
      .forEach((thread) => {
        const lock: Lock = thread.classicalLocksHeld[0];
        if (!lock) {
          // this can happen if thread is TIMED_WAITING due to Thread.sleep()
          return;
        }
        lock.addWaiting(thread);

        // eslint-disable-next-line no-param-reassign
        thread.lockWaitingFor = lock;
        thread.locksHeld.splice(thread.locksHeld.indexOf(lock), 1);
        thread.classicalLocksHeld.splice(thread.classicalLocksHeld.indexOf(lock), 1);
      });
  }

  private static stringToThreadStatus(status: string): ThreadStatus {
    const key = status as keyof typeof ThreadStatus;
    const threadStatus = ThreadStatus[key] as ThreadStatus;
    if (threadStatus) {
      return threadStatus;
    }

    if (status.startsWith('BLOCKED')) {
      return ThreadStatus.BLOCKED;
    }
    if (status.startsWith('WAITING')) {
      return ThreadStatus.WAITING;
    }
    if (status.startsWith('TIMED_WAITING')) {
      return ThreadStatus.TIMED_WAITING;
    }

    return ThreadStatus.UNKNOWN;
  }

  private static getOrCreateLock(locks: Lock[], id: string, className: string, owner?: Thread): Lock {
    const existingLock = locks.find((lock) => lock.hasId(id));
    if (existingLock) {
      if (owner) {
        existingLock.setOwner(owner);
      }
      return existingLock;
    }

    const newLock: Lock = new Lock(id, className, owner);
    locks.push(newLock);
    return newLock;
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
