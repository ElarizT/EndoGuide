import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";

export type FirebaseRuntimeConfig = {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  useEmulators: boolean;
  emulatorHosts: {
    auth: { host: string; port: number };
    firestore: { host: string; port: number };
    storage: { host: string; port: number };
  };
};

export type FirebaseConfigValidation =
  | { ok: true; config: Required<Pick<FirebaseRuntimeConfig, "apiKey" | "authDomain" | "projectId" | "storageBucket" | "messagingSenderId" | "appId">> }
  | { ok: false; missing: string[] };

export type FirebaseServices = {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
};
