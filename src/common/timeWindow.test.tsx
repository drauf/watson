import { describe, expect, it } from 'vitest';
import ThreadDump from '../types/ThreadDump';
import {
  filterThreadDumpsByTimeWindow,
  getClosestTimestamp,
  getDistinctTimestampCount,
  getThreadDumpTimestamps,
  getTimeWindowBounds,
} from './timeWindow';

const threadDumps = [
  new ThreadDump(Date.UTC(2026, 6, 22, 23, 58)),
  new ThreadDump(Date.UTC(2026, 6, 22, 23, 59)),
  new ThreadDump(Date.UTC(2026, 6, 23, 0, 1)),
  new ThreadDump(Date.UTC(2026, 6, 23, 0, 2)),
];

describe('timeWindow', () => {
  it('returns all thread dumps when no window is selected', () => {
    expect(filterThreadDumpsByTimeWindow(threadDumps)).toBe(threadDumps);
  });

  it('filters thread dumps across midnight, including both boundaries', () => {
    expect(filterThreadDumpsByTimeWindow(threadDumps, {
      startEpoch: Date.UTC(2026, 6, 22, 23, 59),
      endEpoch: Date.UTC(2026, 6, 23, 0, 1),
    })).toEqual([
      threadDumps[1],
      threadDumps[2],
    ]);
  });
  it('returns the earliest and latest timestamp regardless of input order', () => {
    expect(getTimeWindowBounds([
      threadDumps[2],
      threadDumps[0],
      threadDumps[3],
    ])).toEqual({
      startEpoch: Date.UTC(2026, 6, 22, 23, 58),
      endEpoch: Date.UTC(2026, 6, 23, 0, 2),
    });
  });

  it('returns undefined bounds for no thread dumps', () => {
    expect(getTimeWindowBounds([])).toBeUndefined();
  });

  it('returns sorted unique timestamps', () => {
    expect(getThreadDumpTimestamps([
      threadDumps[2],
      threadDumps[0],
      threadDumps[2],
      threadDumps[1],
    ])).toEqual([
      threadDumps[0].epoch,
      threadDumps[1].epoch,
      threadDumps[2].epoch,
    ]);
  });

  it('counts distinct timestamps', () => {
    expect(getDistinctTimestampCount([
      threadDumps[0],
      threadDumps[0],
      threadDumps[1],
    ])).toBe(2);
  });

  it('snaps to the closest available timestamp', () => {
    const timestamps = [0, 20_000, 40_000];

    expect(getClosestTimestamp(timestamps, 17_000)).toBe(20_000);
    expect(getClosestTimestamp(timestamps, 10_000)).toBe(0);
    expect(getClosestTimestamp(timestamps, -1)).toBe(0);
    expect(getClosestTimestamp(timestamps, 60_000)).toBe(40_000);
  });

  it('returns undefined when no timestamps are available', () => {
    expect(getClosestTimestamp([], 10_000)).toBeUndefined();
  });
});
