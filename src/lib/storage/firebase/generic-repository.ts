import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  type Firestore
} from "firebase/firestore";
import type { z } from "zod";
import type { CreateInput, ReadOnlyRepository, Repository } from "../types";

function now() {
  return new Date().toISOString();
}

function newId() {
  return crypto.randomUUID();
}

export function createFirebaseRepository<
  T extends { id: string; createdAt: string; updatedAt: string }
>(firestore: Firestore, collectionName: string, schema: z.ZodTypeAny): Repository<T> {
  return {
    async create(input: CreateInput<T>) {
      const timestamp = now();
      const value = schema.parse({
        ...input,
        id: input.id ?? newId(),
        createdAt: input.createdAt ?? timestamp,
        updatedAt: input.updatedAt ?? timestamp
      }) as T;
      await setDoc(doc(firestore, collectionName, value.id), value);
      return value;
    },
    async getById(id: string) {
      const snapshot = await getDoc(doc(firestore, collectionName, id));
      return snapshot.exists() ? (schema.parse(snapshot.data()) as T) : null;
    },
    async listByUser(userId: string) {
      const snapshot = await getDocs(
        query(collection(firestore, collectionName), where("userId", "==", userId))
      );
      return snapshot.docs.map((item) => schema.parse(item.data()) as T);
    },
    async update(id: string, updates: Partial<Omit<T, "id" | "createdAt">>) {
      const updatedAt = now();
      await updateDoc(doc(firestore, collectionName, id), {
        ...updates,
        updatedAt
      });
      const next = await this.getById(id);
      if (!next) throw new Error(`Document ${collectionName}/${id} was not found after update.`);
      return next;
    },
    async delete(id: string) {
      await deleteDoc(doc(firestore, collectionName, id));
    }
  };
}

export function createFirebaseReadOnlyRepository<
  T extends { id: string; createdAt: string; updatedAt: string }
>(firestore: Firestore, collectionName: string, schema: z.ZodTypeAny): ReadOnlyRepository<T> {
  return {
    async getById(id: string) {
      const snapshot = await getDoc(doc(firestore, collectionName, id));
      return snapshot.exists() ? (schema.parse(snapshot.data()) as T) : null;
    },
    async listAll() {
      const snapshot = await getDocs(collection(firestore, collectionName));
      return snapshot.docs.map((item) => schema.parse(item.data()) as T);
    }
  };
}
