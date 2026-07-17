import { getConfiguredStorageMode } from "@/lib/storage/provider";
import { validateFirebaseConfig, getFirebaseRuntimeConfig } from "@/lib/firebase/config";
import { createFirebaseAuthProvider } from "./firebase";
import { createLocalAuthProvider } from "./local";
import type { AuthProvider } from "./types";

export function createAuthProvider(): AuthProvider {
  const mode = getConfiguredStorageMode();
  if (mode === "local") return createLocalAuthProvider();

  const validation = validateFirebaseConfig(
    getFirebaseRuntimeConfig(process.env, mode === "emulator")
  );
  if (!validation.ok) return createLocalAuthProvider();

  return createFirebaseAuthProvider(mode === "emulator");
}
