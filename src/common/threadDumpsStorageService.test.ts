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
});
