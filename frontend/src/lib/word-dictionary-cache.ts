/**
 * Offline word dictionary. Words are cached in IndexedDB so guesses can be
 * validated without a network round-trip. The store is an interface so tests
 * (and non-browser environments) can inject an in-memory implementation.
 */
export interface DictionaryStore {
  putAll(words: string[]): Promise<void>;
  has(word: string): Promise<boolean>;
  count(): Promise<number>;
}

const DB_NAME = "dewordle-dictionary";
const STORE = "words";

function wrap<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function createIndexedDbStore(factory: IDBFactory = indexedDB): DictionaryStore {
  const open = (): Promise<IDBDatabase> =>
    new Promise((resolve, reject) => {
      const req = factory.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

  return {
    async putAll(words) {
      const db = await open();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        const os = tx.objectStore(STORE);
        words.forEach((w) => os.put(true, w.toLowerCase()));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      db.close();
    },
    async has(word) {
      const db = await open();
      const key = await wrap(db.transaction(STORE).objectStore(STORE).getKey(word.toLowerCase()));
      db.close();
      return key !== undefined;
    },
    async count() {
      const db = await open();
      const n = await wrap(db.transaction(STORE).objectStore(STORE).count());
      db.close();
      return n;
    },
  };
}

export function createMemoryStore(): DictionaryStore {
  const set = new Set<string>();
  return {
    async putAll(words) {
      words.forEach((w) => set.add(w.toLowerCase()));
    },
    async has(word) {
      return set.has(word.toLowerCase());
    },
    async count() {
      return set.size;
    },
  };
}

/** Downloads the word list (JSON string[]) and stores it. Returns words cached. */
export async function syncDictionary(
  store: DictionaryStore,
  url: string,
  fetchImpl: typeof fetch = fetch,
): Promise<number> {
  const res = await fetchImpl(url);
  if (!res.ok) throw new Error(`Dictionary fetch failed with status ${res.status}`);
  const words = (await res.json()) as unknown;
  if (!Array.isArray(words) || !words.every((w) => typeof w === "string")) {
    throw new Error("Dictionary payload must be an array of strings");
  }
  await store.putAll(words as string[]);
  return words.length;
}
