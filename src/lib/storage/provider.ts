import type { StorageMode } from "@/lib/domain";
import { getFirebaseRuntimeConfig, validateFirebaseConfig } from "@/lib/firebase/config";
import { createFirebaseStorageProvider } from "./firebase";
import { createLocalStorageProvider } from "./local";
import type { StorageProvider } from "./types";

export function getConfiguredStorageMode(
  env: Record<string, string | undefined> = process.env
): StorageMode {
  const raw = env.NEXT_PUBLIC_ENDOGUIDE_STORAGE_MODE;
  if (raw === "firebase" || raw === "emulator" || raw === "local") return raw;
  return "local";
}

export function createStorageProvider(
  mode = getConfiguredStorageMode()
): StorageProvider {
  if (mode === "local") return createLocalStorageProvider();

  const firebaseConfig = getFirebaseRuntimeConfig();
  const validation = validateFirebaseConfig(firebaseConfig);
  if (!validation.ok) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Falling back to local storage because Firebase config is incomplete.");
    }
    return createLocalStorageProvider();
  }

  return createFirebaseStorageProvider(mode);
}
