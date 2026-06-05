"use client";

import type { MedicalDocument } from "@/lib/domain";
import { createFileStorageProvider } from "@/lib/files";
import type { StorageProvider } from "@/lib/storage";
import { medicalDocumentSchema } from "@/lib/validation";
import { createTimelineEventForDocument } from "@/features/timeline/timeline-service";
import {
  documentMetadataFormSchema,
  type DocumentMetadataFormValues,
  validateDocumentFile
} from "./document-validation";

function optionalIsoDate(date?: string) {
  return date ? new Date(`${date}T12:00:00.000Z`).toISOString() : undefined;
}

function splitList(value?: string) {
  return value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function documentToFormValues(document?: MedicalDocument): DocumentMetadataFormValues {
  return {
    documentType: document?.documentType ?? "Other",
    documentDate: document?.documentDate?.slice(0, 10) ?? "",
    notes: document?.notes ?? "",
    tags: document?.tags?.join(", ") ?? "",
    categories: document?.categories?.join(", ") ?? ""
  };
}

export async function createMedicalDocument(input: {
  storage: StorageProvider;
  userId: string;
  file: File;
  values: DocumentMetadataFormValues;
}) {
  const fileValidation = validateDocumentFile(input.file);
  if (!fileValidation.ok) throw new Error(fileValidation.message);

  const parsed = documentMetadataFormSchema.parse(input.values);
  const documentId = crypto.randomUUID();
  const fileStorage = createFileStorageProvider(input.storage.mode);
  const fileReference = await fileStorage.upload({
    userId: input.userId,
    file: input.file,
    documentId
  });

  const documentInput = medicalDocumentSchema.parse({
    id: documentId,
    userId: input.userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fileName: input.file.name,
    contentType: input.file.type,
    fileSizeBytes: input.file.size,
    storagePath: fileReference.storagePath,
    fileReference: fileReference.fileReference,
    storageMode: fileReference.storageMode,
    uploadedAt: new Date().toISOString(),
    documentDate: optionalIsoDate(parsed.documentDate),
    documentType: parsed.documentType,
    notes: parsed.notes,
    tags: splitList(parsed.tags),
    categories: splitList(parsed.categories),
    extractedTextStatus: "not-started"
  });

  const created = await input.storage.medicalDocuments.create(documentInput);
  await createTimelineEventForDocument(input.storage, {
    userId: input.userId,
    document: created
  });
  return created;
}

export async function updateMedicalDocument(
  storage: StorageProvider,
  id: string,
  values: DocumentMetadataFormValues
) {
  const parsed = documentMetadataFormSchema.parse(values);
  return storage.medicalDocuments.update(id, {
    documentType: parsed.documentType,
    documentDate: optionalIsoDate(parsed.documentDate),
    notes: parsed.notes,
    tags: splitList(parsed.tags),
    categories: splitList(parsed.categories)
  });
}

export async function deleteMedicalDocument(storage: StorageProvider, document: MedicalDocument) {
  const fileStorage = createFileStorageProvider(storage.mode);
  await fileStorage.delete({
    storageMode: document.storageMode,
    storagePath: document.storagePath,
    fileReference: document.fileReference
  });
  await storage.medicalDocuments.delete(document.id);
}
