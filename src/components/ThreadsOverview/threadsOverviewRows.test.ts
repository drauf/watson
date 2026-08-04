import getThreadsOverTime from '../../common/getThreadsOverTime';
import ThreadDump from '../../types/ThreadDump';
import Thread from '../../types/Thread';
import { createThreadOverviewRows } from './threadsOverviewRows';

const createThread = (id: number, name: string): Thread => new Thread(id, name);

describe('createThreadOverviewRows', () => {
  it('preserves grouped row order and sparse dump maps', () => {
    const alphaFirst = createThread(3, 'alpha');
    const alphaSecond = createThread(1, 'alpha');
    const beta = createThread(2, 'beta');
    const alphaFirstDumps = new Map([[1, alphaFirst]]);
    const betaDumps = new Map([[0, beta]]);
    const alphaSecondDumps = new Map([[2, alphaSecond]]);

    const rows = createThreadOverviewRows([betaDumps, alphaFirstDumps, alphaSecondDumps]);

    expect(rows.map((row) => [row.id, row.name])).toEqual([
      [2, 'beta'],
      [3, 'alpha'],
      [1, 'alpha'],
    ]);
    expect(rows[1].threadsByDump).toBe(alphaFirstDumps);
    expect(rows[2].threadsByDump).toBe(alphaSecondDumps);
    expect(rows[1].threadsByDump.get(0)).toBeUndefined();
  });

  it('orders same-name thread groups by ID', () => {
    const dump = new ThreadDump(0);
    dump.threads.push(createThread(3, 'worker'), createThread(1, 'worker'));

    const groups = getThreadsOverTime([dump]);

    expect(groups.map((threads) => threads.values().next().value?.id)).toEqual([1, 3]);
  });
});
