export type AuthUser = {
  id: string;
  email?: string | null;
  displayName?: string | null;
  mode: "firebase" | "local";
};

export type AuthProvider = {
  mode: "firebase" | "local";
  getCurrentUser(): Promise<AuthUser | null>;
  signInDemo?(): Promise<AuthUser>;
  signOut(): Promise<void>;
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void;
};
