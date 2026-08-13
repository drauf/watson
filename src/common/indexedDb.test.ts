import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';
import { IDBFactory } from 'fake-indexeddb';

const loadIndexedDb = () => import('./indexedDb');

let indexedDbFactory: IDBFactory;

beforeEach(() => {
  vi.resetModules();
  indexedDbFactory = new IDBFactory();
  vi.stubGlobal('indexedDB', indexedDbFactory);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('indexedDb', () => {
  it('creates its stores and reads, writes, and removes values', async () => {
    const {
      getIndexedDbValue, indexedDbStores, removeIndexedDbValue, setIndexedDbValue,
    } = await loadIndexedDb();

    expect(await getIndexedDbValue(indexedDbStores.threadDumps, 'import-1')).toBeUndefined();

    await setIndexedDbValue(indexedDbStores.threadDumps, 'import-1', { threadCount: 2 });
    expect(await getIndexedDbValue(indexedDbStores.threadDumps, 'import-1')).toEqual({ threadCount: 2 });

    await removeIndexedDbValue(indexedDbStores.threadDumps, 'import-1');
    expect(await getIndexedDbValue(indexedDbStores.threadDumps, 'import-1')).toBeUndefined();
  });

  it('returns every entry from a store through its cursor', async () => {
    const {
      getIndexedDbEntries, indexedDbStores, setIndexedDbValue,
    } = await loadIndexedDb();

    await setIndexedDbValue(indexedDbStores.lastUsed, 'import-a', 100);
    await setIndexedDbValue(indexedDbStores.lastUsed, 'import-b', 200);

    expect(await getIndexedDbEntries<number>(indexedDbStores.lastUsed)).toEqual([
      ['import-a', 100],
      ['import-b', 200],
    ]);
  });

  it('shares one database-open request across concurrent operations', async () => {
    const open = vi.spyOn(indexedDbFactory, 'open');
    const {
      getIndexedDbEntries, getIndexedDbValue, indexedDbStores,
    } = await loadIndexedDb();

    await Promise.all([
      getIndexedDbValue(indexedDbStores.threadDumps, 'import-1'),
      getIndexedDbEntries(indexedDbStores.threadDumps),
    ]);

    expect(open).toHaveBeenCalledTimes(1);
  });
});
