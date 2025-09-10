/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  vi, describe, it, expect, beforeEach, afterEach,
} from 'vitest';
import AsyncThreadDumpParser, { THREAD_DUMP_DATE_PATTERN } from './AsyncThreadDumpParser';
import ThreadDump from '../types/ThreadDump';
import ThreadStatus from '../types/ThreadStatus';

describe('AsyncThreadDumpParser', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
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
    const mockCallback = vi.fn();
    const mockProgressCallback = vi.fn();

    beforeEach(() => {
      mockCallback.mockClear();
      mockProgressCallback.mockClear();
    });

    it('should parse basic thread dump with single thread', async () => {
      const lines = [
        '2023-01-01 12:00:00',
        '"main" #1 prio=5 os_prio=0 tid=0x00007f8e2c008800 nid=0x1234 runnable [0x00007f8e35b3e000]',
        '   java.lang.Thread.State: RUNNABLE',
        '        at java.lang.Thread.run(Thread.java:748)',
      ];

      const parsePromise = AsyncThreadDumpParser.parseThreadDump(
        lines,
        mockCallback,
        mockProgressCallback,
      );

      // Fast-forward timers to complete async processing
      await vi.runAllTimersAsync();
      await parsePromise;

      expect(mockCallback).toHaveBeenCalledWith(expect.any(ThreadDump));

      const threadDump = mockCallback.mock.calls[0][0] as ThreadDump;
      expect(threadDump.threads).toHaveLength(1);

      const thread = threadDump.threads[0];
      expect(thread.name).toBe('main');
      expect(thread.id).toBe(0x1234);
      expect(thread.status).toBe(ThreadStatus.RUNNABLE);
      expect(thread.stackTrace).toContain('java.lang.Thread.run(Thread.java:748)');
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

      const parsePromise = AsyncThreadDumpParser.parseThreadDump(
        lines,
        mockCallback,
        mockProgressCallback,
      );

      await vi.runAllTimersAsync();
      await parsePromise;

      const threadDump = mockCallback.mock.calls[0][0] as ThreadDump;
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
        mockCallback,
        mockProgressCallback,
      );

      await vi.runAllTimersAsync();
      await parsePromise;

      expect(mockProgressCallback).toHaveBeenCalled();

      // Check that progress was reported with line counts
      const lastCall = mockProgressCallback.mock.calls[mockProgressCallback.mock.calls.length - 1];
      // After the date line is removed with shift(), the remaining lines length is what gets reported
      // Original: ['date', 'line1', 'line2', 'line3'] -> after shift: ['line1', 'line2', 'line3'] (length = 3)
      expect(lastCall[1]).toBe(3); // Total lines to process after date line removal
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

      const parsePromise = AsyncThreadDumpParser.parseThreadDump(
        lines,
        mockCallback,
        mockProgressCallback,
      );

      await vi.runAllTimersAsync();
      await parsePromise;

      const threadDump = mockCallback.mock.calls[0][0] as ThreadDump;
      const thread = threadDump.threads[0];

      expect(thread.lockWaitingFor).toBeDefined();
      expect(thread.locksHeld).toHaveLength(1);
      expect(threadDump.locks).toHaveLength(2);
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
        mockCallback,
        mockProgressCallback,
        customConfig,
      );

      await vi.runAllTimersAsync();
      await parsePromise;

      // Should have been called multiple times due to small chunk size
      expect(mockProgressCallback.mock.calls.length).toBeGreaterThan(1);
    });

    it('should handle empty thread dump', async () => {
      const lines = ['2023-01-01 12:00:00'];

      const parsePromise = AsyncThreadDumpParser.parseThreadDump(
        lines,
        mockCallback,
        mockProgressCallback,
      );

      await vi.runAllTimersAsync();
      await parsePromise;

      const threadDump = mockCallback.mock.calls[0][0] as ThreadDump;
      expect(threadDump.threads).toHaveLength(0);
    });

    it('should prefer nid over tid when both are available', async () => {
      const lines = [
        '2023-01-01 12:00:00',
        '"main" #1 prio=5 os_prio=0 tid=0x1234 nid=0x5678 runnable [0x00007f8e35b3e000]',
        '   java.lang.Thread.State: RUNNABLE',
      ];

      const parsePromise = AsyncThreadDumpParser.parseThreadDump(
        lines,
        mockCallback,
        mockProgressCallback,
      );

      await vi.runAllTimersAsync();
      await parsePromise;

      const threadDump = mockCallback.mock.calls[0][0] as ThreadDump;
      const thread = threadDump.threads[0];
      expect(thread.id).toBe(0x5678); // Should prefer nid over tid
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
      ];

      const parsePromise = AsyncThreadDumpParser.parseThreadDump(
        lines,
        mockCallback,
        mockProgressCallback,
      );

      await vi.runAllTimersAsync();
      await parsePromise;

      const threadDump = mockCallback.mock.calls[0][0] as ThreadDump;
      expect(threadDump.threads).toHaveLength(3);
      expect(threadDump.threads[0].status).toBe(ThreadStatus.BLOCKED);
      expect(threadDump.threads[1].status).toBe(ThreadStatus.WAITING);
      expect(threadDump.threads[2].status).toBe(ThreadStatus.TIMED_WAITING);
    });
  });
});
