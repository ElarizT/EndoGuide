import { connectAuthEmulator, type Auth } from "firebase/auth";
import { connectFirestoreEmulator, type Firestore } from "firebase/firestore";
import { connectStorageEmulator, type FirebaseStorage } from "firebase/storage";
import type { FirebaseRuntimeConfig } from "./types";

let connected = false;

export function connectFirebaseEmulators(
  services: { auth: Auth; firestore: Firestore; storage: FirebaseStorage },
  config: FirebaseRuntimeConfig
) {
  if (!config.useEmulators || connected) return;

  connectAuthEmulator(
    services.auth,
    `http://${config.emulatorHosts.auth.host}:${config.emulatorHosts.auth.port}`,
    { disableWarnings: true }
  );
  connectFirestoreEmulator(
    services.firestore,
    config.emulatorHosts.firestore.host,
    config.emulatorHosts.firestore.port
  );
  connectStorageEmulator(
    services.storage,
    config.emulatorHosts.storage.host,
    config.emulatorHosts.storage.port
  );

  connected = true;
}
