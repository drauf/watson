import Lock from "../types/Lock";
import Thread from "../types/Thread";
import ThreadDump from "../types/ThreadDump";
import ThreadStatus from "../types/ThreadStatus";
import { getDateFromFilename, matchMultipleGroups, matchOne } from "./RegExpUtils";

const THREAD_HEADER_PREFIX: string = '"';

const FILENAME_DATE_PATTERN: RegExp = /\.(\d*)\.txt$/;
const NAME_PATTERN: RegExp = /^\"(.*)\" /;
const NID_PATTERN: RegExp = / nid=([0-9a-fx,]+)/;
const FRAME_PATTERN: RegExp = /^\s+at (.*)/;
const THREAD_STATE_PATTERN: RegExp = /^\s*java.lang.Thread.State: (.*)/;
const SYNCHRONIZATION_STATUS_PATTERN: RegExp = /^\s+- (.*?) +<([x0-9a-f]+)> \(a (.*)\)/;
const LOCKED_OWNABLE_SYNCHRONIZERS_PATTERN: RegExp = /^\s+Locked ownable synchronizers:/;
const NONE_HELD_PATTERN: RegExp = /^\s+- None/;
const HELD_LOCK_PATTERN: RegExp = /^\s+- <([x0-9a-f]+)> \(a (.*)\)/;
const JNI_REFERENCES_PATTERN: RegExp = /^\s?JNI global references: (\d+)/;

export type ParseThreadDumpCallback = (threadDump: ThreadDump) => void;

export default class ThreadDumpParser {

  public static parseThreadDump(file: File, reader: FileReader, callback: ParseThreadDumpCallback) {
    const threadDump: ThreadDump = new ThreadDump();
    threadDump.date = getDateFromFilename(file.name, FILENAME_DATE_PATTERN);

    const lines: string[] = (reader.result as string).split('\n');
    lines.forEach(line => ThreadDumpParser.parseLine(line, threadDump));
    ThreadDumpParser.identifyAnonymousSynchronizers(threadDump.threads);

    callback(threadDump);
  }

  private static currentThread: Thread;

  private static parseLine(line: string, threadDump: ThreadDump): void {
    if (line.startsWith(THREAD_HEADER_PREFIX)) {
      ThreadDumpParser.parseThreadHeader(line, threadDump);
    } else if (line) {
      ThreadDumpParser.parseStackLine(line, threadDump);
    }
  }

  private static parseThreadHeader(header: string, threadDump: ThreadDump): void {
    ThreadDumpParser.currentThread = new Thread();
    threadDump.threads.push(ThreadDumpParser.currentThread);

    ThreadDumpParser.currentThread.name = matchOne(header, NAME_PATTERN).trim();
    ThreadDumpParser.currentThread.id = parseInt(matchOne(header, NID_PATTERN), 10);
  }

  private static parseStackLine(line: string, threadDump: ThreadDump): void {
    if (!ThreadDumpParser.currentThread) {
      return;
    }

    const frame: string = matchOne(line, FRAME_PATTERN);
    if (frame) {
      ThreadDumpParser.currentThread.stackTrace.push(frame);
      return;
    }

    const threadState: string = matchOne(line, THREAD_STATE_PATTERN);
    if (threadState) {
      ThreadDumpParser.currentThread.status = ThreadDumpParser.stringToThreadStatus(threadState);
      return;
    }

    const synchronizationStatus: string[] = matchMultipleGroups(line, SYNCHRONIZATION_STATUS_PATTERN);
    if (synchronizationStatus && synchronizationStatus.length === 3) {
      const state: string = synchronizationStatus[0];
      const lockId: string = synchronizationStatus[1];
      const className: string = synchronizationStatus[2];

      switch (state) {
        case "waiting on":
        case "parking to wait for":
        case "waiting to lock":
          let lock: Lock = ThreadDumpParser.getOrCreateLock(threadDump.locks, lockId, className);
          lock.waiting.push(ThreadDumpParser.currentThread);
          ThreadDumpParser.currentThread.lockWaitingFor = lock;
          return;

        case "locked":
          if (ThreadDumpParser.currentThread.lockWaitingFor && ThreadDumpParser.currentThread.lockWaitingFor.id === lockId) {
            // lock is released while waiting for the notification
            return;
          }
          lock = ThreadDumpParser.getOrCreateLock(threadDump.locks, lockId, className);
          lock.owner = ThreadDumpParser.currentThread;
          ThreadDumpParser.currentThread.locksHeld.push(lock);
          ThreadDumpParser.currentThread.classicalLocksHeld.push(lock);
          return;

        case "eliminated":
          // redundant lock that has been removed in the bytecode - we don't care about those
          return;

        default:
          console.warn(`Unknown synchronziation status: ${line}`);
          return;
      }
    }

    const lockHeld: string[] = matchMultipleGroups(line, HELD_LOCK_PATTERN);
    if (lockHeld && lockHeld.length === 2) {
      const lockId: string = lockHeld[0];
      const className: string = lockHeld[1];

      const lock: Lock = ThreadDumpParser.getOrCreateLock(threadDump.locks, lockId, className);
      lock.owner = ThreadDumpParser.currentThread;
      ThreadDumpParser.currentThread.locksHeld.push(lock);
      return;
    }

    // ignore those lines, as they provide no useful data
    if (matchOne(line, LOCKED_OWNABLE_SYNCHRONIZERS_PATTERN)
      || matchOne(line, NONE_HELD_PATTERN)
      || matchOne(line, JNI_REFERENCES_PATTERN)) {
      return;
    }

    console.warn(`Unable to parse line: ${line}`);
  }

  private static identifyAnonymousSynchronizers(threads: Thread[]): void {
    // sometimes threads wait for notification, but the thread dump doesn't say on which object
    // this function guesses it's the last hit classical lock
    const validStatuses = [ThreadStatus.BLOCKED, ThreadStatus.TIMED_WAITING, ThreadStatus.WAITING];

    threads
      .filter(thread => !thread.lockWaitingFor)
      .filter(thread => validStatuses.includes(thread.status))
      .forEach(thread => {
        const lock: Lock = thread.classicalLocksHeld[0];
        lock.owner = null;
        lock.waiting.push(thread);

        thread.lockWaitingFor = lock;
        thread.locksHeld.splice(thread.locksHeld.indexOf(lock), 1);
        thread.classicalLocksHeld.splice(thread.classicalLocksHeld.indexOf(lock), 1);
      })
  }

  private static stringToThreadStatus(status: string): ThreadStatus {
    const key = status as keyof typeof ThreadStatus;
    const threadStatus = ThreadStatus[key];
    if (threadStatus !== undefined) {
      return threadStatus;
    }

    if (status.startsWith("BLOCKED")) {
      return ThreadStatus.BLOCKED;
    }
    if (status.startsWith("WAITING")) {
      return ThreadStatus.WAITING;
    }
    if (status.startsWith("TIME_WAITING")) {
      return ThreadStatus.TIMED_WAITING;
    }

    return ThreadStatus.UNKNOWN;
  }

  private static getOrCreateLock(locks: Lock[], id: string, className: string): Lock {
    for (const existingLock of locks) {
      if (existingLock.id === id) {
        return existingLock;
      }
    }

    const newLock: Lock = new Lock();
    newLock.id = id;
    newLock.className = className;

    locks.push(newLock);
    return newLock;
  }
}
