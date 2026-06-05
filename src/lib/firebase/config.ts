import type { FirebaseConfigValidation, FirebaseRuntimeConfig } from "./types";

function readBoolean(value: string | undefined, fallback = false) {
  if (value == null) return fallback;
  return value === "true" || value === "1";
}

function readPort(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getFirebaseRuntimeConfig(
  env: Record<string, string | undefined> = process.env
): FirebaseRuntimeConfig {
  return {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
    useEmulators: readBoolean(env.NEXT_PUBLIC_FIREBASE_USE_EMULATORS),
    emulatorHosts: {
      auth: {
        host: env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST ?? "127.0.0.1",
        port: readPort(env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT, 9099)
      },
      firestore: {
        host: env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST ?? "127.0.0.1",
        port: readPort(env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT, 8080)
      },
      storage: {
        host: env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST ?? "127.0.0.1",
        port: readPort(env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_PORT, 9199)
      }
    }
  };
}

export function validateFirebaseConfig(
  config: FirebaseRuntimeConfig
): FirebaseConfigValidation {
  const required = {
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId
  };

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    return { ok: false, missing };
  }

  return {
    ok: true,
    config: {
      apiKey: required.apiKey!,
      authDomain: required.authDomain!,
      projectId: required.projectId!,
      storageBucket: required.storageBucket!,
      messagingSenderId: required.messagingSenderId!,
      appId: required.appId!
    }
  };
}
