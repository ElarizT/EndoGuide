import type { StorageMode } from "@/lib/domain";
import { createFirebaseFileStorageProvider } from "./firebase-file-storage";
import { createLocalFileStorageProvider } from "./local-file-storage";
import type { FileStorageProvider } from "./types";

export function createFileStorageProvider(mode: StorageMode): FileStorageProvider {
  if (mode === "local") return createLocalFileStorageProvider();
  return createFirebaseFileStorageProvider(mode);
}

