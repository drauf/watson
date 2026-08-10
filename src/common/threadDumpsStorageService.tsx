import ThreadDump from '../types/ThreadDump';
import {
  getIndexedDbEntries,
  getIndexedDbValue,
  indexedDbStores,
  removeIndexedDbValue,
  setIndexedDbValue,
} from './indexedDb';

let currentThreadDumps: ThreadDump[];
let currentThreadDumpsKey: string | undefined;

const logError = (error: unknown) => {
  console.error(error);
};

const markPerformance = (phase: string): void => {
  performance.mark(`watson:${phase}`);
};

const getFromStorage = async (key: string): Promise<ThreadDump[]> => {
  markPerformance('storage:read:start');
  const fromStorage = await getIndexedDbValue<ThreadDump[]>(indexedDbStores.threadDumps, key);
  markPerformance('storage:read:complete');
  if (fromStorage === undefined) {
    return [];
  }

  markPerformance('storage:restore:start');
  currentThreadDumps = fromStorage;
  currentThreadDumpsKey = key;
  markPerformance('storage:restore:complete');
  setIndexedDbValue(indexedDbStores.lastUsed, key, new Date().valueOf()).catch(logError);
  return currentThreadDumps;
};

// Given a key, returns a promise that resolves to the stored thread dumps.
export const getThreadDumpsAsync = async (key: string): Promise<ThreadDump[]> => {
  if (currentThreadDumps === undefined || currentThreadDumpsKey !== key) {
    return getFromStorage(key);
  }

  return currentThreadDumps;
};

// Stores thread dumps in persistent storage for subsequent page loads.
// Returns a key that can be used to retrieve the thread dumps.
export const setParsedData = async (parsedDumps: ThreadDump[]): Promise<string> => {
  currentThreadDumps = parsedDumps;
  const key = crypto.randomUUID();
  currentThreadDumpsKey = key;

  markPerformance('storage:write:start');
  await setIndexedDbValue(indexedDbStores.threadDumps, key, parsedDumps);
  markPerformance('storage:write:complete');
  setIndexedDbValue(indexedDbStores.lastUsed, key, new Date().valueOf()).catch(logError);
  return key;
};

// Clears currently held thread dump & JFR cpu usage.
// Does not modify data storage.
export const clearCurrentData = (): void => {
  currentThreadDumps = [];
  currentThreadDumpsKey = undefined;
};

// Clears all persisted thread dumps & JFR cpu usage not used in the last 7 days.
export const clearOldData = (): void => {
  const sevenDaysAgo = new Date().setDate(new Date().getDate() - 7);

  getIndexedDbEntries<number>(indexedDbStores.lastUsed)
    .then((entries) => Promise.all(entries
      .filter(([, date]) => date < sevenDaysAgo)
      .flatMap(([key]) => [
        removeIndexedDbValue(indexedDbStores.threadDumps, key),
        removeIndexedDbValue(indexedDbStores.cpuUsageJfrList, key),
        removeIndexedDbValue(indexedDbStores.lastUsed, key),
      ])))
    .catch(logError);
};
