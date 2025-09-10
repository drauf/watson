/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable func-names */

import {
  vi, describe, it, expect, beforeEach, afterEach,
} from 'vitest';
import AsyncParser, { ProgressCallback, CompletionCallback } from './AsyncParser';
import ThreadDump from '../types/ThreadDump';

// Mock the AsyncThreadDumpParser
vi.mock('./AsyncThreadDumpParser', () => ({
  default: {
    parseThreadDump: vi.fn(),
  },
  THREAD_DUMP_DATE_PATTERN: /^([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2})\r?$/,
}));

// Mock the CPU usage parsers
vi.mock('./cpuusage/os/TopCpuUsageParser', () => ({
  default: {
    parseCpuUsage: vi.fn(),
  },
  CPU_USAGE_TIMESTAMP_PATTERN: /^top - /,
}));

vi.mock('./cpuusage/jfr/CpuUsageJfrParser', () => ({
  default: {
    parseCpuUsage: vi.fn(),
  },
  CPU_USAGE_JFR_FIRST_LINE_PATTERN: /^"Thread Name"/,
}));

describe('AsyncParser', () => {
  let mockOnFilesParsed: CompletionCallback;
  let mockOnProgress: ProgressCallback;
  let parser: AsyncParser;

  const createMockFile = (name: string, content: string): File => {
    const blob = new Blob([content], { type: 'text/plain' });
    return new File([blob], name, { type: 'text/plain' });
  };

  beforeEach(() => {
    mockOnFilesParsed = vi.fn();
    mockOnProgress = vi.fn();
    parser = new AsyncParser(mockOnFilesParsed, mockOnProgress);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create parser with required callback', () => {
      const onFilesParsed = vi.fn();
      const testParser = new AsyncParser(onFilesParsed);
      expect(testParser).toBeDefined();
    });

    it('should create parser with optional progress callback', () => {
      const onFilesParsed = vi.fn();
      const onProgress = vi.fn();
      const testParser = new AsyncParser(onFilesParsed, onProgress);
      expect(testParser).toBeDefined();
    });
  });

  describe('parseFiles', () => {
    it('should throw error if already processing', async () => {
      const file = createMockFile('test.txt', '2023-01-01 12:00:00\n"Thread-1" #1 prio=5 tid=0x1 nid=0x1');

      // Start first parsing (don't await)
      const firstParse = parser.parseFiles([file]);

      // Try to start second parsing while first is running
      await expect(parser.parseFiles([file])).rejects.toThrow('Parser is already processing files');

      // Wait for first parsing to complete
      await firstParse;
    });

    it('should report progress during file parsing', async () => {
      const file = createMockFile('test.txt', '2023-01-01 12:00:00\n"Thread-1" #1 prio=5 tid=0x1 nid=0x1');

      await parser.parseFiles([file]);

      expect(mockOnProgress).toHaveBeenCalled();

      // Check if progress was reported with correct phases
      const progressCalls = (mockOnProgress as any).mock.calls;
      const phases = progressCalls.map((call: any) => call[0].phase);

      expect(phases).toContain('reading');
      expect(phases).toContain('parsing');
      expect(phases).toContain('grouping');
      expect(phases).toContain('complete');
    });

    it('should call completion callback with parsed thread dumps', async () => {
      const threadDumpContent = '2023-01-01 12:00:00\n"Thread-1" #1 prio=5 tid=0x1 nid=0x1';
      const file = createMockFile('test.txt', threadDumpContent);

      // Mock the AsyncThreadDumpParser to return a thread dump with threads
      const mockThreadDump = new ThreadDump(Date.parse('2023-01-01 12:00:00'));
      // Add a mock thread so the thread dump isn't filtered out
      const mockThread = { id: 1, name: 'Thread-1' } as any;
      mockThreadDump.threads.push(mockThread);
      
      const AsyncThreadDumpParser = await import('./AsyncThreadDumpParser');
      (AsyncThreadDumpParser.default.parseThreadDump as any).mockImplementation(
        (_lines: string[], callback: any) => {
          callback(mockThreadDump);
          return Promise.resolve();
        },
      );

      await parser.parseFiles([file]);

      expect(mockOnFilesParsed).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          epoch: mockThreadDump.epoch,
          threads: expect.any(Array),
        }),
      ]));
    });

    it('should handle multiple files', async () => {
      const file1 = createMockFile('dump1.txt', '2023-01-01 12:00:00\n"Thread-1" #1 prio=5 tid=0x1 nid=0x1');
      const file2 = createMockFile('dump2.txt', '2023-01-01 12:01:00\n"Thread-2" #2 prio=5 tid=0x2 nid=0x2');

      await parser.parseFiles([file1, file2]);

      expect(mockOnProgress).toHaveBeenCalled();
      expect(mockOnFilesParsed).toHaveBeenCalled();

      // Check that progress was reported for both files
      const progressCalls = (mockOnProgress as any).mock.calls;
      const fileNames = progressCalls.map((call: any) => call[0].fileName);
      expect(fileNames).toContain('dump1.txt');
      expect(fileNames).toContain('dump2.txt');
    });

    it('should handle empty files gracefully', async () => {
      const emptyFile = createMockFile('empty.txt', '');

      await parser.parseFiles([emptyFile]);

      expect(mockOnFilesParsed).toHaveBeenCalled();
    });

    it('should handle file reading errors', async () => {
      // Create a file that will cause FileReader to fail
      const file = createMockFile('test.txt', 'content');

      // Mock FileReader to simulate error
      const originalFileReader = global.FileReader;
      global.FileReader = vi.fn().mockImplementation(() => ({
        readAsText: vi.fn().mockImplementation(function (this: any) {
          // Simulate error
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new Error('File read error'));
            }
          }, 0);
        }),
      })) as any;

      await expect(parser.parseFiles([file])).rejects.toThrow();

      // Restore original FileReader
      global.FileReader = originalFileReader;
    });
  });

  describe('progress reporting', () => {
    it('should report correct progress percentages', async () => {
      const file = createMockFile('test.txt', '2023-01-01 12:00:00\n"Thread-1" #1 prio=5 tid=0x1 nid=0x1');

      await parser.parseFiles([file]);

      const progressCalls = (mockOnProgress as any).mock.calls;
      const percentages = progressCalls.map((call: any) => call[0].percentage);

      // Check that percentages progress from 0 to 100
      expect(percentages[0]).toBeGreaterThanOrEqual(0);
      expect(percentages[percentages.length - 1]).toBe(100);
    });

    it('should report file processing counts', async () => {
      const file1 = createMockFile('dump1.txt', '2023-01-01 12:00:00\n"Thread-1" #1 prio=5 tid=0x1 nid=0x1');
      const file2 = createMockFile('dump2.txt', '2023-01-01 12:01:00\n"Thread-2" #2 prio=5 tid=0x2 nid=0x2');

      await parser.parseFiles([file1, file2]);

      const progressCalls = (mockOnProgress as any).mock.calls;
      const totalFiles = progressCalls.map((call: any) => call[0].totalFiles);
      const filesProcessed = progressCalls.map((call: any) => call[0].filesProcessed);

      // All progress reports should show total files as 2
      expect(totalFiles.every((count: number) => count === 2)).toBe(true);

      // Files processed should start at 0 and progress
      expect(filesProcessed[0]).toBe(0);
      expect(Math.max(...filesProcessed)).toBe(2);
    });
  });
});
