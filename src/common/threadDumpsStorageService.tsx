import { parse, stringify } from 'flatted';
import localforage from 'localforage';
import SparkMD5 from 'spark-md5';
import ThreadDump from '../types/ThreadDump';
import CpuUsageJfr from '../parser/cpuusage/jfr/CpuUsageJfr';

let currentThreadDumps: ThreadDump[];
let currentCpuUsageJfrList: CpuUsageJfr[];
const lastUsedStorage = localforage.createInstance({ name: 'lastUsed' });
const threadDumpsStorage = localforage.createInstance({ name: 'threadDumps' });
const cpuUsageJfrListStorage = localforage.createInstance({ name: 'cpuUsageJfrList' });

const logError = (error: unknown) => {
  console.error(error);
};

const getFromStorage = async (key: string): Promise<ThreadDump[]> => {
  const fromStorage = await threadDumpsStorage.getItem<string>(key);
  if (!fromStorage) {
    return [];
  }

  currentThreadDumps = parse(fromStorage) as ThreadDump[];
  lastUsedStorage.setItem(key, new Date().valueOf()).catch(logError);
  return currentThreadDumps;
};

const getCpuUsageJfrFromStorage = async (key: string): Promise<CpuUsageJfr[]> => {
  const fromStorage = await cpuUsageJfrListStorage.getItem<string>(key);
  if (!fromStorage) {
    return [];
  }

  currentCpuUsageJfrList = parse(fromStorage) as CpuUsageJfr[];
  lastUsedStorage.setItem(key, new Date().valueOf()).catch(logError);
  return currentCpuUsageJfrList;
};

// Given a key, returns a promise that resolves to the stored thread dumps.
export const getThreadDumpsAsync = async (key: string): Promise<ThreadDump[]> => {
  if (currentThreadDumps === undefined) {
    return getFromStorage(key);
  }

  return currentThreadDumps;
};

export const getCpuUsageJfrAsync = async (key: string): Promise<CpuUsageJfr[]> => {
  if (currentCpuUsageJfrList === undefined || currentCpuUsageJfrList.length === 0) {
    return getCpuUsageJfrFromStorage(key);
  }

  return currentCpuUsageJfrList;
};

// Stores thread dumps in persistent storage for subsequent page loads.
// Returns a key that can be used to retrieve the thread dumps.
export const setParsedData = (parsedDumps: ThreadDump[], cpuUsageJfrList: CpuUsageJfr[]): string => {
  currentThreadDumps = parsedDumps;
  const stringifiedThreadDumps = stringify(currentThreadDumps);
  const stringifiedCpuUsageJfrList = stringify(cpuUsageJfrList);
  const key = SparkMD5.hash(stringifiedThreadDumps + stringifiedCpuUsageJfrList);
  threadDumpsStorage.setItem(key, stringifiedThreadDumps).catch(logError);
  cpuUsageJfrListStorage.setItem(key, stringifiedCpuUsageJfrList).catch(logError);
  return key;
};

// Clears currently held thread dump & JFR cpu usage.
// Does not modify data storage.
export const clearCurrentData = (): void => {
  currentThreadDumps = [];
  currentCpuUsageJfrList = [];
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
