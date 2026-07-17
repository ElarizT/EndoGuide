import type { StorageMode } from "@/lib/domain";

export function getConfiguredStorageMode(
  env: Record<string, string | undefined> = process.env
): StorageMode {
  const raw = env.NEXT_PUBLIC_ENDOGUIDE_STORAGE_MODE;
  if (raw === "firebase" || raw === "emulator" || raw === "local") return raw;
  return "local";
}
