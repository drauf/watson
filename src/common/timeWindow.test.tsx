import { describe, expect, it } from 'vitest';
import ThreadDump from '../types/ThreadDump';
import {
  filterThreadDumpsByTimeWindow,
  getDistinctTimestampCount,
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

  it('counts distinct timestamps', () => {
    expect(getDistinctTimestampCount([
      threadDumps[0],
      threadDumps[0],
      threadDumps[1],
    ])).toBe(2);
  });
});
