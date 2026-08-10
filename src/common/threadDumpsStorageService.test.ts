import {
  beforeEach, describe, expect, it, vi,
} from 'vitest';
import ThreadDump from '../types/ThreadDump';

const stores = new Map<string, Map<string, unknown>>();

vi.mock('localforage', () => ({
  default: {
    createInstance: ({ name }: { name: string }) => {
      let store = stores.get(name);
      if (store === undefined) {
        store = new Map();
        stores.set(name, store);
      }

      return {
        getItem: vi.fn(async (key: string) => store?.get(key) ?? null),
        setItem: vi.fn(async (key: string, value: unknown) => {
          store?.set(key, value);
          return value;
        }),
        removeItem: vi.fn(async (key: string) => {
          store?.delete(key);
        }),
        iterate: vi.fn(async (callback: (value: number, key: string) => void) => {
          store?.forEach((value, key) => callback(value as number, key));
        }),
      };
    },
  },
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
});
