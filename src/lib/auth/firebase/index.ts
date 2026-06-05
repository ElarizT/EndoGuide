import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User as FirebaseUser
} from "firebase/auth";
import { getFirebaseServices } from "@/lib/firebase/client";
import type { AuthProvider, AuthUser } from "../types";

function mapFirebaseUser(user: FirebaseUser): AuthUser {
  return {
    id: user.uid,
    email: user.email,
    displayName: user.displayName,
    mode: "firebase"
  };
}

export function createFirebaseAuthProvider(): AuthProvider {
  const services = getFirebaseServices();
  if (!services) {
    throw new Error("Firebase auth provider requested, but Firebase config is missing.");
  }

  return {
    mode: "firebase",
    async getCurrentUser() {
      const user = services.auth.currentUser;
      return user ? mapFirebaseUser(user) : null;
    },
    async signOut() {
      await firebaseSignOut(services.auth);
    },
    onAuthStateChanged(callback) {
      return onAuthStateChanged(services.auth, (user) => {
        callback(user ? mapFirebaseUser(user) : null);
      });
    }
  };
}
