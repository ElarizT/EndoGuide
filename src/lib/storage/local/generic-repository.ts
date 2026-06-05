import type { z } from "zod";
import { LocalDatabase } from "@/lib/local/local-db";
import type { LocalStoreName } from "@/lib/local/types";
import type { CreateInput, ReadOnlyRepository, Repository } from "../types";

function now() {
  return new Date().toISOString();
}

function newId() {
  return crypto.randomUUID();
}

export function createLocalRepository<
  T extends { id: string; createdAt: string; updatedAt: string }
>(
  db: LocalDatabase,
  storeName: LocalStoreName,
  schema: z.ZodTypeAny
): Repository<T> {
  return {
    async create(input: CreateInput<T>) {
      const timestamp = now();
      const value = schema.parse({
        ...input,
        id: input.id ?? newId(),
        createdAt: input.createdAt ?? timestamp,
        updatedAt: input.updatedAt ?? timestamp
      }) as T;
      return db.put(storeName, value);
    },
    async getById(id: string) {
      const value = await db.get<T>(storeName, id);
      return value ? (schema.parse(value) as T) : null;
    },
    async listByUser(userId: string) {
      const values = await db.list<T>(storeName, userId);
      return values.map((item) => schema.parse(item) as T);
    },
    async update(id: string, updates: Partial<Omit<T, "id" | "createdAt">>) {
      const existing = await this.getById(id);
      if (!existing) throw new Error(`Document ${storeName}/${id} was not found.`);
      const value = schema.parse({
        ...existing,
        ...updates,
        id,
        createdAt: existing.createdAt,
        updatedAt: now()
      }) as T;
      return db.put(storeName, value);
    },
    async delete(id: string) {
      await db.delete(storeName, id);
    }
  };
}

export function createLocalReadOnlyRepository<
  T extends { id: string; createdAt: string; updatedAt: string }
>(
  db: LocalDatabase,
  storeName: LocalStoreName,
  schema: z.ZodTypeAny
): ReadOnlyRepository<T> {
  return {
    async getById(id: string) {
      const value = await db.get<T>(storeName, id);
      return value ? (schema.parse(value) as T) : null;
    },
    async listAll() {
      const values = await db.list<T>(storeName);
      return values.map((item) => schema.parse(item) as T);
    }
  };
}
