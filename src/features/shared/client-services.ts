"use client";

import { createAuthProvider } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";
import { createStorageProvider } from "@/lib/storage";
import type { StorageProvider } from "@/lib/storage";

export type ClientServices = {
  user: AuthUser;
  storage: StorageProvider;
};

export async function getClientServices(): Promise<ClientServices> {
  const auth = createAuthProvider();
  let user = await auth.getCurrentUser();

  if (!user && auth.mode === "local" && auth.signInDemo) {
    user = await auth.signInDemo();
  }

  if (!user) {
    throw new Error("Sign in is required before viewing or saving health records.");
  }

  return {
    user,
    storage: createStorageProvider()
  };
}
