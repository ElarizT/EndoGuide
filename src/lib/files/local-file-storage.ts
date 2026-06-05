import { LocalDatabase } from "@/lib/local/local-db";
import type { FileStorageProvider, LocalDocumentBlob, StoredFileReference } from "./types";

export const LOCAL_FILE_LIMITATION_NOTICE =
  "Local-only files are stored in this browser's local storage/IndexedDB when available. They are not synced, are tied to this browser profile, and may be removed if browser site data is cleared.";

export function createLocalFileStorageProvider(db = new LocalDatabase()): FileStorageProvider {
  return {
    mode: "local",
    async upload({ userId, file, documentId }) {
      const record: LocalDocumentBlob = {
        id: documentId,
        userId,
        documentId,
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        size: file.size,
        blob: file,
        createdAt: new Date().toISOString()
      };
      await db.put("documentBlobs", record);
      return {
        storageMode: "local",
        fileReference: documentId,
        limitationNotice: LOCAL_FILE_LIMITATION_NOTICE
      };
    },
    async delete(reference: StoredFileReference) {
      if (reference.fileReference) {
        await db.delete("documentBlobs", reference.fileReference);
      }
    },
    getLocalNotice() {
      return LOCAL_FILE_LIMITATION_NOTICE;
    }
  };
}
