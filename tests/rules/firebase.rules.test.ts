import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment
} from "@firebase/rules-unit-testing";
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

const projectId = "demo-endoguide";
let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules: readFileSync(resolve("firestore.rules"), "utf8")
    },
    storage: {
      rules: readFileSync(resolve("storage.rules"), "utf8")
    }
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await testEnv.clearStorage();
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe("Firestore rules", () => {
  it("allows owners and rejects cross-user access", async () => {
    const ownerDb = testEnv.authenticatedContext("owner").firestore();
    const otherDb = testEnv.authenticatedContext("other").firestore();
    const record = doc(ownerDb, "symptomEntries", "entry-1");

    await assertSucceeds(
      setDoc(record, {
        id: "entry-1",
        userId: "owner",
        createdAt: "2026-06-05T12:00:00.000Z",
        updatedAt: "2026-06-05T12:00:00.000Z"
      })
    );
    await assertSucceeds(getDoc(record));
    await assertFails(getDoc(doc(otherDb, "symptomEntries", "entry-1")));
    await assertFails(deleteDoc(doc(otherDb, "symptomEntries", "entry-1")));
  });

  it("keeps curated collections read-only despite the generic match", async () => {
    const db = testEnv.authenticatedContext("owner").firestore();
    await assertFails(
      setDoc(doc(db, "biologicalEntities", "entity-1"), {
        id: "entity-1",
        userId: "owner"
      })
    );
  });

  it("keeps audit logs append-only", async () => {
    const db = testEnv.authenticatedContext("owner").firestore();
    const log = doc(db, "auditLogs", "log-1");
    await assertSucceeds(setDoc(log, { id: "log-1", userId: "owner" }));
    await assertFails(updateDoc(log, { eventType: "changed" }));
    await assertFails(deleteDoc(log));
  });
});

describe("Storage rules", () => {
  it("allows supported owner uploads", async () => {
    const storage = testEnv.authenticatedContext("owner").storage();
    await assertSucceeds(
      uploadBytes(
        ref(storage, "users/owner/documents/document-1/record.pdf"),
        new Uint8Array([1, 2, 3]),
        { contentType: "application/pdf" }
      )
    );
  });

  it("rejects cross-user and unsupported uploads", async () => {
    const storage = testEnv.authenticatedContext("other").storage();
    await assertFails(
      uploadBytes(
        ref(storage, "users/owner/documents/document-1/record.pdf"),
        new Uint8Array([1]),
        { contentType: "application/pdf" }
      )
    );
    await assertFails(
      uploadBytes(
        ref(storage, "users/other/documents/document-2/record.exe"),
        new Uint8Array([1]),
        { contentType: "application/octet-stream" }
      )
    );
  });
});
