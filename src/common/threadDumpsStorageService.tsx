import localforage from 'localforage';
import ThreadDump from '../types/ThreadDump';

let currentThreadDumps: ThreadDump[];
const indexedDbStorage = { driver: localforage.INDEXEDDB };
const lastUsedStorage = localforage.createInstance({ name: 'lastUsed', ...indexedDbStorage });
const threadDumpsStorage = localforage.createInstance({ name: 'threadDumps', ...indexedDbStorage });
const cpuUsageJfrListStorage = localforage.createInstance({ name: 'cpuUsageJfrList', ...indexedDbStorage });

const logError = (error: unknown) => {
  console.error(error);
};

const markPerformance = (phase: string): void => {
  performance.mark(`watson:${phase}`);
};

const getFromStorage = async (key: string): Promise<ThreadDump[]> => {
  markPerformance('storage:read:start');
  const fromStorage = await threadDumpsStorage.getItem<ThreadDump[]>(key);
  markPerformance('storage:read:complete');
  if (!fromStorage) {
    return [];
  }

  markPerformance('storage:restore:start');
  currentThreadDumps = fromStorage;
  markPerformance('storage:restore:complete');
  lastUsedStorage.setItem(key, new Date().valueOf()).catch(logError);
  return currentThreadDumps;
};

// Given a key, returns a promise that resolves to the stored thread dumps.
export const getThreadDumpsAsync = async (key: string): Promise<ThreadDump[]> => {
  if (currentThreadDumps === undefined) {
    return getFromStorage(key);
  }

  return currentThreadDumps;
};

// Stores thread dumps in persistent storage for subsequent page loads.
// Returns a key that can be used to retrieve the thread dumps.
export const setParsedData = async (parsedDumps: ThreadDump[]): Promise<string> => {
  currentThreadDumps = parsedDumps;
  const key = crypto.randomUUID();

  markPerformance('storage:write:start');
  await threadDumpsStorage.setItem(key, parsedDumps);
  markPerformance('storage:write:complete');
  lastUsedStorage.setItem(key, new Date().valueOf()).catch(logError);
  return key;
};

// Clears currently held thread dump & JFR cpu usage.
// Does not modify data storage.
export const clearCurrentData = (): void => {
  currentThreadDumps = [];
};

// Clears all persisted thread dumps & JFR cpu usage not used in the last 7 days.
export const clearOldData = (): void => {
  const sevenDaysAgo = new Date().setDate(new Date().getDate() - 7);

  lastUsedStorage.iterate((date: number, key) => {
    if (date < sevenDaysAgo) {
      threadDumpsStorage.removeItem(key).catch(logError);
      cpuUsageJfrListStorage.removeItem(key).catch(logError);
      lastUsedStorage.removeItem(key).catch(logError);
    }
  }).catch(logError);
};
