import { describe, expect, it } from 'vitest';
import ThreadDump from './ThreadDump';

describe('ThreadDump', () => {
  it('preserves chronological order across midnight', () => {
    const beforeMidnight = ThreadDump.from('2026-07-22 23:58:00');
    const afterMidnight = ThreadDump.from('2026-07-23 00:01:00');

    expect(afterMidnight.epoch).toBeGreaterThan(beforeMidnight.epoch);
  });

  it('prefers a timestamp from the file name over content', () => {
    const threadDump = ThreadDump.from(
      '2026-07-22 10:13:45',
      Date.UTC(2026, 6, 22, 10, 13, 46),
    );

    expect(threadDump.epoch).toBe(Date.UTC(2026, 6, 22, 10, 13, 46));
  });
});
