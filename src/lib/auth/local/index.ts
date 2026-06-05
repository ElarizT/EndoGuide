import type { AuthProvider, AuthUser } from "../types";
import { getLocalSetting, setLocalSetting, removeLocalSetting } from "@/lib/local/local-storage";

const LOCAL_USER_KEY = "local-user";

function createLocalUser(): AuthUser {
  return {
    id: crypto.randomUUID(),
    displayName: "Local user",
    mode: "local"
  };
}

export function createLocalAuthProvider(): AuthProvider {
  return {
    mode: "local",
    async getCurrentUser() {
      return getLocalSetting<AuthUser | null>(LOCAL_USER_KEY, null);
    },
    async signInDemo() {
      const existing = getLocalSetting<AuthUser | null>(LOCAL_USER_KEY, null);
      if (existing) return existing;
      const user = createLocalUser();
      setLocalSetting(LOCAL_USER_KEY, user);
      return user;
    },
    async signOut() {
      removeLocalSetting(LOCAL_USER_KEY);
    },
    onAuthStateChanged(callback) {
      this.getCurrentUser().then(callback).catch(() => callback(null));
      return () => undefined;
    }
  };
}
