const DATABASE_NAME = 'watson';
const DATABASE_VERSION = 1;

export const indexedDbStores = {
  threadDumps: 'threadDumps',
  lastUsed: 'lastUsed',
  cpuUsageJfrList: 'cpuUsageJfrList',
} as const;

export type IndexedDbStore = typeof indexedDbStores[keyof typeof indexedDbStores];

let databasePromise: Promise<IDBDatabase> | undefined;

const openDatabase = (): Promise<IDBDatabase> => {
  if (databasePromise === undefined) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
      request.onerror = () => reject(request.error);
      request.onupgradeneeded = () => {
        const database = request.result;
        Object.values(indexedDbStores).forEach((store) => {
          if (!database.objectStoreNames.contains(store)) {
            database.createObjectStore(store);
          }
        });
      };
      request.onsuccess = () => resolve(request.result);
    });
  }

  return databasePromise;
};

const completeTransaction = (transaction: IDBTransaction): Promise<void> => new Promise((resolve, reject) => {
  transaction.addEventListener('complete', () => resolve(), { once: true });
  transaction.addEventListener('error', () => reject(transaction.error), { once: true });
  transaction.addEventListener('abort', () => reject(transaction.error), { once: true });
});

export const getIndexedDbValue = async <T>(store: IndexedDbStore, key: string): Promise<T | undefined> => {
  const database = await openDatabase();
  const transaction = database.transaction(store, 'readonly');
  const request = transaction.objectStore(store).get(key);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
};

export const setIndexedDbValue = async <T>(store: IndexedDbStore, key: string, value: T): Promise<void> => {
  const database = await openDatabase();
  const transaction = database.transaction(store, 'readwrite');
  transaction.objectStore(store).put(value, key);
  await completeTransaction(transaction);
};

export const removeIndexedDbValue = async (store: IndexedDbStore, key: string): Promise<void> => {
  const database = await openDatabase();
  const transaction = database.transaction(store, 'readwrite');
  transaction.objectStore(store).delete(key);
  await completeTransaction(transaction);
};

export const getIndexedDbEntries = async <T>(store: IndexedDbStore): Promise<[string, T][]> => {
  const database = await openDatabase();
  const transaction = database.transaction(store, 'readonly');
  const objectStore = transaction.objectStore(store);

  return new Promise((resolve, reject) => {
    const entries: [string, T][] = [];
    const request = objectStore.openCursor();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor === null) {
        resolve(entries);
        return;
      }

      entries.push([String(cursor.key), cursor.value as T]);
      cursor.continue();
    };
  });
};
