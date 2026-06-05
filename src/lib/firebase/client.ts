import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFirebaseRuntimeConfig, validateFirebaseConfig } from "./config";
import { connectFirebaseEmulators } from "./emulator";
import type { FirebaseServices } from "./types";

let services: FirebaseServices | null = null;

export function getFirebaseServices(): FirebaseServices | null {
  if (services) return services;

  const runtimeConfig = getFirebaseRuntimeConfig();
  const validation = validateFirebaseConfig(runtimeConfig);

  if (!validation.ok) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `Firebase is not configured. Missing: ${validation.missing.join(", ")}`
      );
    }
    return null;
  }

  const app =
    getApps().length > 0
      ? getApp()
      : initializeApp({
          apiKey: validation.config.apiKey,
          authDomain: validation.config.authDomain,
          projectId: validation.config.projectId,
          storageBucket: validation.config.storageBucket,
          messagingSenderId: validation.config.messagingSenderId,
          appId: validation.config.appId
        });

  services = {
    app,
    auth: getAuth(app),
    firestore: getFirestore(app),
    storage: getStorage(app)
  };

  connectFirebaseEmulators(services, runtimeConfig);
  return services;
}
