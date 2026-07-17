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
  env: Record<string, string | undefined> = process.env,
  forceEmulators = false
): FirebaseRuntimeConfig {
  const useEmulators = forceEmulators || readBoolean(env.NEXT_PUBLIC_FIREBASE_USE_EMULATORS);
  const emulatorProjectId = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "demo-endoguide";

  return {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY ?? (useEmulators ? "demo-api-key" : undefined),
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? (useEmulators ? `${emulatorProjectId}.firebaseapp.com` : undefined),
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? (useEmulators ? emulatorProjectId : undefined),
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? (useEmulators ? `${emulatorProjectId}.appspot.com` : undefined),
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? (useEmulators ? "000000000000" : undefined),
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID ?? (useEmulators ? "1:000000000000:web:endoguide" : undefined),
    useEmulators,
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
