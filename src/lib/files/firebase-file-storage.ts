import { deleteObject, ref, uploadBytes } from "firebase/storage";
import { getFirebaseServices } from "@/lib/firebase/client";
import type { StorageMode } from "@/lib/domain";
import type { FileStorageProvider, StoredFileReference } from "./types";

export function createFirebaseFileStorageProvider(
  mode: "firebase" | "emulator" = "firebase"
): FileStorageProvider {
  const services = getFirebaseServices(mode === "emulator");
  if (!services) {
    throw new Error("Firebase file storage requested, but Firebase config is missing.");
  }

  return {
    mode,
    async upload({ userId, file, documentId }) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `users/${userId}/documents/${documentId}/${safeName}`;
      await uploadBytes(ref(services.storage, storagePath), file, {
        contentType: file.type || undefined
      });
      return { storageMode: mode, storagePath };
    },
    async delete(reference: StoredFileReference) {
      if (reference.storagePath) {
        await deleteObject(ref(services.storage, reference.storagePath));
      }
    },
    getLocalNotice() {
      return null;
    }
  };
}
