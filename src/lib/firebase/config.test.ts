import { describe, expect, it } from "vitest";
import { getFirebaseRuntimeConfig, validateFirebaseConfig } from "./config";

describe("firebase config", () => {
  it("reports missing required config", () => {
    const validation = validateFirebaseConfig(getFirebaseRuntimeConfig({}));
    expect(validation.ok).toBe(false);
    if (!validation.ok) {
      expect(validation.missing).toContain("apiKey");
      expect(validation.missing).toContain("projectId");
    }
  });

  it("accepts complete config", () => {
    const validation = validateFirebaseConfig(
      getFirebaseRuntimeConfig({
        NEXT_PUBLIC_FIREBASE_API_KEY: "demo-api-key",
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "demo.firebaseapp.com",
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: "demo-project",
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "demo.appspot.com",
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123",
        NEXT_PUBLIC_FIREBASE_APP_ID: "1:123:web:abc"
      })
    );

    expect(validation.ok).toBe(true);
  });

  it("uses isolated demo config when emulator mode is forced", () => {
    const config = getFirebaseRuntimeConfig({}, true);
    const validation = validateFirebaseConfig(config);

    expect(config.useEmulators).toBe(true);
    expect(config.projectId).toBe("demo-endoguide");
    expect(validation.ok).toBe(true);
  });
});
