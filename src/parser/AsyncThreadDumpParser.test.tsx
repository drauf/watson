import {
  vi, describe, it, expect, beforeEach, afterEach,
} from 'vitest';
import AsyncThreadDumpParser, { THREAD_DUMP_DATE_PATTERN } from './AsyncThreadDumpParser';
import ThreadDump from '../types/ThreadDump';
import { ThreadLabel } from '../common/threadLabels';
import ThreadStatus from '../types/ThreadStatus';

describe('AsyncThreadDumpParser', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('THREAD_DUMP_DATE_PATTERN', () => {
    it('should match valid thread dump date format', () => {
      expect(THREAD_DUMP_DATE_PATTERN.test('2023-01-01 12:00:00')).toBe(true);
      expect(THREAD_DUMP_DATE_PATTERN.test('2023-12-31 23:59:59')).toBe(true);
    });

    it('should not match invalid date formats', () => {
      expect(THREAD_DUMP_DATE_PATTERN.test('invalid date')).toBe(false);
      expect(THREAD_DUMP_DATE_PATTERN.test('2023-1-1 12:00:00')).toBe(false);
      expect(THREAD_DUMP_DATE_PATTERN.test('23-01-01 12:00:00')).toBe(false);
    });
  });

  describe('parseThreadDump', () => {
    const mockProgressCallback = vi.fn();

    const parseThreadDump = async (lines: readonly string[]): Promise<ThreadDump> => {
      let parsedThreadDump: ThreadDump | undefined;
      await AsyncThreadDumpParser.parseThreadDump(lines, (threadDump) => {
        parsedThreadDump = threadDump;
      });
      if (!parsedThreadDump) {
        throw new Error('Parser did not produce a thread dump');
      }
      return parsedThreadDump;
    };

    beforeEach(() => {
      mockProgressCallback.mockClear();
    });

    it('should parse basic thread dump with single thread', async () => {
      const lines = [
        '2023-01-01 12:00:00',
        '"main" #1 prio=5 os_prio=0 tid=0x00007f8e2c008800 nid=0x1234 runnable [0x00007f8e35b3e000]',
        '   java.lang.Thread.State: RUNNABLE',
        '        at java.lang.Thread.run(Thread.java:748)',
      ];

      const threadDump = await parseThreadDump(lines);
      expect(threadDump.threads).toHaveLength(1);

      const thread = threadDump.threads[0];
      expect(thread.name).toBe('main');
      expect(thread.id).toBe(0x1234);
      expect(thread.status).toBe(ThreadStatus.RUNNABLE);
      expect(thread.stackTrace).toContain('java.lang.Thread.run(Thread.java:748)');
      expect(thread.labels).toEqual([ThreadLabel.BACKGROUND]);
    });

    it('assigns static labels after parsing the complete stack trace', async () => {
      const lines = [
        '2023-01-01 12:00:00',
        '"http-nio-8080-exec-1" #1 prio=5 os_prio=0 tid=0x00007f8e2c008800 nid=0x1234 runnable [0x00007f8e35b3e000]',
        '   java.lang.Thread.State: RUNNABLE',
        '        at org.apache.lucene.search.IndexSearcher.search(IndexSearcher.java:1)',
        '        at org.postgresql.jdbc.PgStatement.execute(PgStatement.java:1)',
      ];

      const threadDump = await parseThreadDump(lines);
      expect(threadDump.threads[0].labels).toEqual([
        ThreadLabel.HTTP,
        ThreadLabel.INDEX_SEARCH,
        ThreadLabel.DATABASE,
      ]);
    });

    it('should parse multiple threads in single dump', async () => {
      const lines = [
        '2023-01-01 12:00:00',
        '"main" #1 prio=5 os_prio=0 tid=0x00007f8e2c008800 nid=0x1234 runnable [0x00007f8e35b3e000]',
        '   java.lang.Thread.State: RUNNABLE',
        '        at java.lang.Thread.run(Thread.java:748)',
        '',
        '"Thread-1" #2 prio=5 os_prio=0 tid=0x00007f8e2c009900 nid=0x5678 waiting [0x00007f8e35b3f000]',
        '   java.lang.Thread.State: WAITING (on object monitor)',
        '        at java.lang.Object.wait(Native Method)',
      ];

      const threadDump = await parseThreadDump(lines);
      expect(threadDump.threads).toHaveLength(2);

      expect(threadDump.threads[0].name).toBe('main');
      expect(threadDump.threads[1].name).toBe('Thread-1');
    });

    it('should report progress during parsing', async () => {
      const lines = [
        '2023-01-01 12:00:00',
        '"main" #1 prio=5 os_prio=0 tid=0x00007f8e2c008800 nid=0x1234 runnable [0x00007f8e35b3e000]',
        '   java.lang.Thread.State: RUNNABLE',
        '        at java.lang.Thread.run(Thread.java:748)',
      ];

      const parsePromise = AsyncThreadDumpParser.parseThreadDump(
        lines,
        () => undefined,
        mockProgressCallback,
      );

      await vi.runAllTimersAsync();
      await parsePromise;

      expect(mockProgressCallback).toHaveBeenCalled();

      const lastCall = mockProgressCallback.mock.calls[mockProgressCallback.mock.calls.length - 1];
      // The parser excludes the date line when calculating the total
      expect(lastCall[1]).toBe(3);
    });

    it('should handle thread with locks', async () => {
      const lines = [
        '2023-01-01 12:00:00',
        '"Thread-1" #1 prio=5 os_prio=0 tid=0x00007f8e2c008800 nid=0x1234 waiting [0x00007f8e35b3e000]',
        '   java.lang.Thread.State: BLOCKED (on object monitor)',
        '        at com.example.Test.method(Test.java:10)',
        '        - waiting to lock <0x000000076ab62208> (a java.lang.Object)',
        '        - locked <0x000000076ab62218> (a java.lang.String)',
      ];

      const threadDump = await parseThreadDump(lines);
      const thread = threadDump.threads[0];

      expect(thread.lockWaitingFor).toBeDefined();
      expect(thread.locksHeld).toHaveLength(1);
      expect(threadDump.locks).toHaveLength(2);
    });

    it('does not retain a lock released while waiting', async () => {
      const lines = [
        '2023-01-01 12:00:00',
        '"Thread-1" #1 prio=5 os_prio=0 tid=0x00007f8e2c008800 nid=0x1234 waiting [0x00007f8e35b3e000]',
        '   java.lang.Thread.State: BLOCKED (on object monitor)',
        '        - waiting to lock <0x000000076ab62208> (a java.lang.Object)',
        '        - locked <0x000000076ab62208> (a java.lang.Object)',
      ];

      const threadDump = await parseThreadDump(lines);
      expect(threadDump.threads[0].locksHeld).toHaveLength(0);
      expect(threadDump.locks).toHaveLength(1);
    });

    it('should handle custom performance config', async () => {
      const customConfig = {
        threadDumpChunkSize: 1, // Process one line at a time
        threadDumpProcessingDelay: 10,
      };

      const lines = [
        '2023-01-01 12:00:00',
        '"main" #1 prio=5 os_prio=0 tid=0x00007f8e2c008800 nid=0x1234 runnable [0x00007f8e35b3e000]',
        '   java.lang.Thread.State: RUNNABLE',
      ];

      const parsePromise = AsyncThreadDumpParser.parseThreadDump(
        lines,
        () => undefined,
        mockProgressCallback,
        customConfig,
      );

      await vi.runAllTimersAsync();
      await parsePromise;

      // Should have been called multiple times due to small chunk size
      expect(mockProgressCallback.mock.calls.length).toBeGreaterThan(1);
    });

    it('should handle empty thread dump', async () => {
      const threadDump = await parseThreadDump(['2023-01-01 12:00:00']);

      expect(threadDump.threads).toHaveLength(0);
    });

    it('parses a decimal nid from a JFR-generated thread dump', async () => {
      const threadDump = await parseThreadDump([
        '2026-07-21 14:37:58',
        '"JFR Recorder Thread" #40 prio=5 os_prio=0 cpu=0.01ms elapsed=1.00s tid=0x0000000000000001 nid=7867 runnable',
      ]);

      expect(threadDump.threads[0].id).toBe(7867);
    });

    it('should prefer nid over tid when both are available', async () => {
      const lines = [
        '2023-01-01 12:00:00',
        '"main" #1 prio=5 os_prio=0 tid=0x1234 nid=0x5678 runnable [0x00007f8e35b3e000]',
        '   java.lang.Thread.State: RUNNABLE',
      ];

      const threadDump = await parseThreadDump(lines);
      const thread = threadDump.threads[0];
      expect(thread.id).toBe(0x5678); // Should prefer nid over tid
    });

    it('falls back to tid when nid is unavailable', async () => {
      const threadDump = await parseThreadDump([
        '2026-07-21 14:37:58',
        '"tid-only" #1 prio=5 tid=0x7b runnable',
      ]);

      expect(threadDump.threads[0].id).toBe(123);
    });

    it('moves Java module prefixes to the end of stack frames', async () => {
      const threadDump = await parseThreadDump([
        '2026-07-21 14:37:58',
        '"module-thread" #1 prio=5 tid=0x1 nid=0x2 runnable',
        '        at java.base@17.0.6/java.lang.Thread.run(Thread.java:1)',
      ]);

      expect(threadDump.threads[0].stackTrace).toEqual([
        'java.lang.Thread.run(Thread.java:1) java.base@17.0.6',
      ]);
    });

    it('parses supported synchronization states and direct held locks', async () => {
      const threadDump = await parseThreadDump([
        '2026-07-21 14:37:58',
        '"waiting-on" #1 prio=5 tid=0x1 nid=0x1 waiting',
        '   java.lang.Thread.State: WAITING',
        '        - waiting on <0x1> (a java.base/java.lang.Object)',
        '"parking" #2 prio=5 tid=0x2 nid=0x2 waiting',
        '   java.lang.Thread.State: WAITING',
        '        - parking to wait for <0x2> (a java.util.concurrent.locks.AbstractQueuedSynchronizer)',
        '"relocking" #3 prio=5 tid=0x3 nid=0x3 waiting',
        '   java.lang.Thread.State: WAITING',
        '        - waiting to re-lock in wait() <0x3> (a java.lang.Object)',
        '"eliminated" #4 prio=5 tid=0x4 nid=0x4 runnable',
        '        - eliminated <0x4> (a java.lang.Object)',
        '"holder" #5 prio=5 tid=0x5 nid=0x5 runnable',
        '        - <0x5> (a java.lang.Object)',
      ]);

      expect(threadDump.locks.map((lock) => lock.id)).toEqual(['0x1', '0x2', '0x3', '0x5']);
      expect(threadDump.locks[0].className).toBe('java.base/java.lang.Object');
      expect(threadDump.threads.slice(0, 3).map((thread) => thread.lockWaitingFor?.id)).toEqual(['0x1', '0x2', '0x3']);
      expect(threadDump.threads[3].locksHeld).toEqual([]);
      expect(threadDump.threads[4].locksHeld.map((lock) => lock.id)).toEqual(['0x5']);
    });

    it('links a waiting thread to a lock owner parsed later in the dump', async () => {
      const threadDump = await parseThreadDump([
        '2026-07-21 14:37:58',
        '"waiter" #1 prio=5 tid=0x1 nid=0x1 waiting',
        '   java.lang.Thread.State: BLOCKED',
        '        - waiting to lock <0x9> (a java.lang.Object)',
        '"owner" #2 prio=5 tid=0x2 nid=0x2 runnable',
        '        - locked <0x9> (a java.lang.Object)',
      ]);

      const [waiter, owner] = threadDump.threads;
      expect(waiter.lockWaitingFor?.owner).toBe(owner);
      expect(owner.locksHeld).toEqual([waiter.lockWaitingFor]);
    });

    it('infers an anonymous synchronizer from a held lock', async () => {
      const threadDump = await parseThreadDump([
        '2026-07-21 14:37:58',
        '"waiting-for-notification" #1 prio=5 tid=0x1 nid=0x1 waiting',
        '   java.lang.Thread.State: WAITING',
        '        - locked <0xa> (a java.lang.Object)',
      ]);

      const [waitingForNotification] = threadDump.threads;
      expect(waitingForNotification.lockWaitingFor?.id).toBe('0xa');
      expect(waitingForNotification.locksHeld).toEqual([]);
      expect(waitingForNotification.classicalLocksHeld).toEqual([]);
    });

    it('marks unsupported thread states as unknown and warns about unknown lock states', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const threadDump = await parseThreadDump([
        '2026-07-21 14:37:58',
        '"unsupported" #1 prio=5 tid=0x1 nid=0x1 waiting',
        '   java.lang.Thread.State: PARKED',
        '        - waiting somewhere <0xb> (a java.lang.Object)',
      ]);

      expect(threadDump.threads[0].status).toBe(ThreadStatus.UNKNOWN);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('Unknown synchronization status'));
    });

    it('should handle different thread states', async () => {
      const lines = [
        '2023-01-01 12:00:00',
        '"Thread-BLOCKED" #1 prio=5 os_prio=0 tid=0x1234 nid=0x1234 waiting [0x00007f8e35b3e000]',
        '   java.lang.Thread.State: BLOCKED (on object monitor)',
        '',
        '"Thread-WAITING" #2 prio=5 os_prio=0 tid=0x1235 nid=0x1235 waiting [0x00007f8e35b3e000]',
        '   java.lang.Thread.State: WAITING (on object monitor)',
        '',
        '"Thread-TIMED_WAITING" #3 prio=5 os_prio=0 tid=0x1236 nid=0x1236 waiting [0x00007f8e35b3e000]',
        '   java.lang.Thread.State: TIMED_WAITING (sleeping)',
        '',
        '"Thread-NEW" #4 prio=5 os_prio=0 tid=0x1237 nid=0x1237 new [0x00007f8e35b3e000]',
        '   java.lang.Thread.State: NEW',
        '',
        '"Thread-TERMINATED" #5 prio=5 os_prio=0 tid=0x1238 nid=0x1238 terminated [0x00007f8e35b3e000]',
        '   java.lang.Thread.State: TERMINATED',
      ];

      const threadDump = await parseThreadDump(lines);
      expect(threadDump.threads).toHaveLength(5);
      expect(threadDump.threads.map((thread) => thread.status)).toEqual([
        ThreadStatus.BLOCKED,
        ThreadStatus.WAITING,
        ThreadStatus.TIMED_WAITING,
        ThreadStatus.NEW,
        ThreadStatus.TERMINATED,
      ]);
    });
  });
});
