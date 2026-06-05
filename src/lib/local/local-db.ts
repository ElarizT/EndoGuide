import type { LocalStoreName } from "./types";

const DB_NAME = "endoguide-local";
const DB_VERSION = 1;

export const localStoreNames: LocalStoreName[] = [
  "patientProfiles",
  "symptomEntries",
  "treatmentEntries",
  "medicationLogs",
  "appointments",
  "medicalDocuments",
  "documentBlobs",
  "documentTags",
  "doctorReports",
  "timelineEvents",
  "researchNotes",
  "researchSources",
  "biologicalEntities",
  "entityRelationships",
  "guidelineSnippets",
  "aiInteractionLogs",
  "userSettings",
  "auditLogs"
];

const memoryStores = new Map<LocalStoreName, Map<string, unknown>>();

function hasIndexedDb() {
  return typeof indexedDB !== "undefined";
}

function openIndexedDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      for (const storeName of localStoreNames) {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: "id" });
        }
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function initializeLocalDatabase() {
  if (!hasIndexedDb()) {
    for (const name of localStoreNames) {
      if (!memoryStores.has(name)) memoryStores.set(name, new Map());
    }
    return { mode: "memory" as const, stores: localStoreNames };
  }

  const db = await openIndexedDb();
  db.close();
  return { mode: "indexeddb" as const, stores: localStoreNames };
}

export class LocalDatabase {
  async put<T extends { id: string }>(storeName: LocalStoreName, value: T): Promise<T> {
    if (!hasIndexedDb()) {
      const store = memoryStores.get(storeName) ?? new Map<string, unknown>();
      store.set(value.id, value);
      memoryStores.set(storeName, store);
      return value;
    }

    const db = await openIndexedDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readwrite");
      tx.objectStore(storeName).put(value);
      tx.oncomplete = () => {
        db.close();
        resolve(value);
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  }

  async get<T>(storeName: LocalStoreName, id: string): Promise<T | null> {
    if (!hasIndexedDb()) {
      return (memoryStores.get(storeName)?.get(id) as T | undefined) ?? null;
    }

    const db = await openIndexedDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readonly");
      const request = tx.objectStore(storeName).get(id);
      request.onsuccess = () => {
        db.close();
        resolve((request.result as T | undefined) ?? null);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  }

  async list<T>(storeName: LocalStoreName, userId?: string): Promise<T[]> {
    if (!hasIndexedDb()) {
      const values = Array.from(memoryStores.get(storeName)?.values() ?? []) as T[];
      return userId ? values.filter((item) => (item as { userId?: string }).userId === userId) : values;
    }

    const db = await openIndexedDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readonly");
      const request = tx.objectStore(storeName).getAll();
      request.onsuccess = () => {
        db.close();
        const values = request.result as T[];
        resolve(userId ? values.filter((item) => (item as { userId?: string }).userId === userId) : values);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  }

  async delete(storeName: LocalStoreName, id: string): Promise<void> {
    if (!hasIndexedDb()) {
      memoryStores.get(storeName)?.delete(id);
      return;
    }

    const db = await openIndexedDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readwrite");
      tx.objectStore(storeName).delete(id);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  }
}
