import { getConfiguredStorageMode } from "@/lib/config";
import type { StorageMode } from "@/lib/domain";
import { getFirebaseRuntimeConfig, validateFirebaseConfig } from "@/lib/firebase/config";
import { createFirebaseStorageProvider } from "./firebase";
import { createLocalStorageProvider } from "./local";
import type { StorageProvider } from "./types";

export { getConfiguredStorageMode } from "@/lib/config";

export function createStorageProvider(
  mode = getConfiguredStorageMode()
): StorageProvider {
  if (mode === "local") return createLocalStorageProvider();

  const firebaseConfig = getFirebaseRuntimeConfig(process.env, mode === "emulator");
  const validation = validateFirebaseConfig(firebaseConfig);
  if (!validation.ok) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Falling back to local storage because Firebase config is incomplete.");
    }
    return createLocalStorageProvider();
  }

  return createFirebaseStorageProvider(mode);
}
