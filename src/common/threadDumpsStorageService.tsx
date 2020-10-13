import { parse, stringify } from 'flatted';
import localforage from 'localforage';
import SparkMD5 from 'spark-md5';
import ThreadDump from '../types/ThreadDump';

let currentThreadDumps: ThreadDump[];
const lastUsedStorage = localforage.createInstance({ name: 'lastUsed' });
const threadDumpsStorage = localforage.createInstance({ name: 'threadDumps' });

async function getFromStorage(key: string) {
  const fromStorage = await threadDumpsStorage.getItem<string>(key);

  // update the "Last used" date if the key exists
  if (fromStorage) {
    lastUsedStorage.setItem(key, new Date().valueOf());
  }

  currentThreadDumps = fromStorage ? parse(fromStorage) : [];
  return currentThreadDumps;
}

// Given a key, returns a promise that resolves to the stored thread dumps.
export const getThreadDumpsAsync = async (key: string): Promise<ThreadDump[]> => {
  if (currentThreadDumps === undefined) {
    return getFromStorage(key);
  }

  return currentThreadDumps;
};

// Stores thread dumps in persistent storage for subsequent page loads.
// Returns a key that can be used to retrieve the thread dumps.
export const setThreadDumps = (parsedDumps: ThreadDump[]): string => {
  currentThreadDumps = parsedDumps;
  const stringified = stringify(currentThreadDumps);
  const key = SparkMD5.hash(stringified);
  threadDumpsStorage.setItem(key, stringified);
  return key;
};

// Clears currently held thread dump.
// Does not modify data storage.
export const clearCurrentThreadDump = (): void => {
  currentThreadDumps = [];
};

// Clears all persisted thread dumps not used in the last 7 days.
export const clearOldThreadDumps = (): void => {
  const sevenDaysAgo = new Date().setDate(new Date().getDate() - 7);

  lastUsedStorage.iterate((date: number, key) => {
    if (date < sevenDaysAgo) {
      threadDumpsStorage.removeItem(key);
      lastUsedStorage.removeItem(key);
    }
  });
};
