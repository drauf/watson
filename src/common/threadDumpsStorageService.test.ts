import {
  beforeEach, describe, expect, it, vi,
} from 'vitest';
import ThreadDump from '../types/ThreadDump';

const stores = new Map<string, Map<string, unknown>>();

vi.mock('./indexedDb', () => ({
  indexedDbStores: {
    threadDumps: 'threadDumps',
    lastUsed: 'lastUsed',
    cpuUsageJfrList: 'cpuUsageJfrList',
  },
  getIndexedDbEntries: vi.fn(async (store: string) => Array.from(stores.get(store)?.entries() ?? [])),
  getIndexedDbValue: vi.fn(async (store: string, key: string) => stores.get(store)?.get(key)),
  removeIndexedDbValue: vi.fn(async (store: string, key: string) => {
    stores.get(store)?.delete(key);
  }),
  setIndexedDbValue: vi.fn(async (store: string, key: string, value: unknown) => {
    let entries = stores.get(store);
    if (entries === undefined) {
      entries = new Map();
      stores.set(store, entries);
    }
    entries.set(key, value);
  }),
}));

describe('threadDumpsStorageService', () => {
  beforeEach(() => {
    stores.clear();
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubGlobal('crypto', { randomUUID: () => 'thread-dump-import' });
  });

  it('stores parsed ThreadDumps directly and restores their cyclic relationships', async () => {
    const { setParsedData } = await import('./threadDumpsStorageService');
    const threadDump = new ThreadDump(123);
    threadDump.threads.push({ name: 'thread' } as never);
    const key = await setParsedData([threadDump]);

    expect(key).toBe('thread-dump-import');
    expect(stores.get('threadDumps')?.get(key)).toEqual([threadDump]);

    vi.resetModules();
    const reloadedStorageService = await import('./threadDumpsStorageService');
    const restored = await reloadedStorageService.getThreadDumpsAsync(key);

    expect(restored).toEqual([threadDump]);
  });

  it('loads the requested import instead of a different cached import', async () => {
    let keyNumber = 0;
    vi.stubGlobal('crypto', { randomUUID: () => `thread-dump-import-${++keyNumber}` });
    const { getThreadDumpsAsync, setParsedData } = await import('./threadDumpsStorageService');
    const firstThreadDump = new ThreadDump(123);
    const secondThreadDump = new ThreadDump(456);
    const firstKey = await setParsedData([firstThreadDump]);
    await setParsedData([secondThreadDump]);

    expect(await getThreadDumpsAsync(firstKey)).toEqual([firstThreadDump]);
  });

  it('returns an empty list when an import is not stored', async () => {
    const { getThreadDumpsAsync } = await import('./threadDumpsStorageService');

    expect(await getThreadDumpsAsync('missing-import')).toEqual([]);
  });

  it('returns a matching import from memory without reading storage again', async () => {
    const key = 'cached-import';
    const threadDumps = [new ThreadDump(123)];
    stores.set('threadDumps', new Map([[key, threadDumps]]));
    const { getThreadDumpsAsync } = await import('./threadDumpsStorageService');
    const { getIndexedDbValue } = await import('./indexedDb');

    expect(await getThreadDumpsAsync(key)).toEqual(threadDumps);
    expect(await getThreadDumpsAsync(key)).toEqual(threadDumps);
    expect(getIndexedDbValue).toHaveBeenCalledTimes(1);
  });

  it('removes all stale persisted records while retaining recent imports', async () => {
    const staleKey = 'stale-import';
    const recentKey = 'recent-import';
    const staleDate = new Date().valueOf() - 8 * 24 * 60 * 60 * 1000;
    const recentDate = new Date().valueOf();
    stores.set('threadDumps', new Map([[staleKey, [new ThreadDump(1)]], [recentKey, [new ThreadDump(2)]]]));
    stores.set('cpuUsageJfrList', new Map([[staleKey, []], [recentKey, []]]));
    stores.set('lastUsed', new Map([[staleKey, staleDate], [recentKey, recentDate]]));
    const { clearOldData } = await import('./threadDumpsStorageService');

    clearOldData();

    await vi.waitFor(() => {
      expect(stores.get('threadDumps')).toEqual(new Map([[recentKey, [new ThreadDump(2)]]]));
      expect(stores.get('cpuUsageJfrList')).toEqual(new Map([[recentKey, []]]));
      expect(stores.get('lastUsed')).toEqual(new Map([[recentKey, recentDate]]));
    });
  });
});
