import { describe, expect, it, vi } from "vitest";
import type { DoctorReport, MedicalDocument } from "@/lib/domain";
import { doctorReportSchema, medicalDocumentSchema } from "@/lib/validation";
import { createFirebaseRepository } from "./generic-repository";

const firestoreMocks = vi.hoisted(() => {
  const store = new Map<string, Record<string, unknown>>();
  return {
    store,
    collection: vi.fn((_db: unknown, collectionName: string) => ({ collectionName })),
    deleteDoc: vi.fn(async (docRef: { id: string }) => {
      store.delete(docRef.id);
    }),
    doc: vi.fn((_db: unknown, collectionName: string, id: string) => ({ collectionName, id })),
    getDoc: vi.fn(async (docRef: { id: string }) => ({
      exists: () => store.has(docRef.id),
      data: () => store.get(docRef.id)
    })),
    getDocs: vi.fn(async () => ({
      docs: [...store.values()].map((value) => ({ data: () => value }))
    })),
    query: vi.fn((collectionRef: unknown) => collectionRef),
    setDoc: vi.fn(async (docRef: { id: string }, value: Record<string, unknown>) => {
      store.set(docRef.id, value);
    }),
    updateDoc: vi.fn(async (docRef: { id: string }, updates: Record<string, unknown>) => {
      store.set(docRef.id, { ...store.get(docRef.id), ...updates });
    }),
    where: vi.fn()
  };
});

vi.mock("firebase/firestore", () => firestoreMocks);

describe("firebase document repository mocks", () => {
  it("creates and reads document metadata through Firestore APIs", async () => {
    firestoreMocks.store.clear();
    const repository = createFirebaseRepository<MedicalDocument>(
      {} as never,
      "medicalDocuments",
      medicalDocumentSchema
    );

    const created = await repository.create({
      id: "firebase-doc-1",
      userId: "firebase-user",
      fileName: "letter.pdf",
      contentType: "application/pdf",
      storageMode: "firebase",
      storagePath: "users/firebase-user/documents/firebase-doc-1/letter.pdf",
      uploadedAt: "2026-06-05T12:00:00.000Z",
      documentType: "Clinic Letter"
    });

    expect(created.id).toBe("firebase-doc-1");
    expect(await repository.getById("firebase-doc-1", "firebase-user")).toMatchObject({
      fileName: "letter.pdf",
      storageMode: "firebase"
    });
    expect(firestoreMocks.setDoc).toHaveBeenCalled();
  });

  it("persists report metadata through the Firebase repository boundary", async () => {
    firestoreMocks.store.clear();
    const repository = createFirebaseRepository<DoctorReport>(
      {} as never,
      "doctorReports",
      doctorReportSchema
    );
    const created = await repository.create({
      id: "firebase-report-1",
      userId: "firebase-user",
      reportType: "quality-of-life",
      title: "Quality of Life",
      generatedAt: "2026-01-01T00:00:00.000Z",
      sections: [{ heading: "Recorded impacts", body: "Stored values only." }],
      disclaimerIncluded: true,
      generatorVersion: "phase-4-v1"
    });

    expect(await repository.getById(created.id, "firebase-user")).toMatchObject({
      reportType: "quality-of-life",
      generatorVersion: "phase-4-v1"
    });
  });
});
