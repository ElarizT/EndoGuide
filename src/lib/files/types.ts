import type { StorageMode } from "@/lib/domain";

export type StoredFileReference = {
  storageMode: StorageMode;
  storagePath?: string;
  fileReference?: string;
  limitationNotice?: string;
};

export type FileStorageProvider = {
  mode: StorageMode;
  upload(input: {
    userId: string;
    file: File;
    documentId: string;
  }): Promise<StoredFileReference>;
  delete(reference: StoredFileReference): Promise<void>;
  getLocalNotice(): string | null;
};

export type LocalDocumentBlob = {
  id: string;
  userId: string;
  documentId: string;
  fileName: string;
  contentType: string;
  size: number;
  blob: Blob;
  createdAt: string;
};
