import { createAuthProvider } from "./provider";

export async function getCurrentUser() {
  return createAuthProvider().getCurrentUser();
}
