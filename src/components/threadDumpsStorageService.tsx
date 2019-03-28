import { parse, stringify } from 'flatted';
import localforage from 'localforage';
import SparkMD5 from 'spark-md5';
import ThreadDump from '../types/ThreadDump';

localforage.config({
  name: 'watson',
  version: 1.0,
});
let threadDumps: ThreadDump[];

// Given a key, returns a promise that resolves to the stored thread dumps.
export const getThreadDumpsAsync = async (key: string): Promise<ThreadDump[]> => {
  if (threadDumps === undefined) {
    const fromStorage = await localforage.getItem<string>(key);
    const parsed = fromStorage ? parse(fromStorage) : [];
    threadDumps = parsed;
    return parsed;
  }

  return Promise.resolve(threadDumps);
};

// Stores thread dumps in persistent storage for subsequent page loads.
// Returns a key that can be used to retrieve the thread dumps.
export const setThreadDumps = (parsedDumps: ThreadDump[]): string => {
  threadDumps = parsedDumps;
  const stringified = stringify(threadDumps);
  const key = SparkMD5.hash(stringified);
  localforage.setItem(key, stringified);
  return key;
};

// Clears currently held thread dumps.
// Does not modify data storage.
export const clearThreadDumps = (): void => {
  threadDumps = [];
};
