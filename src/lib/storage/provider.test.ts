import { describe, expect, it } from "vitest";
import { createStorageProvider, getConfiguredStorageMode } from "./provider";

describe("storage provider selection", () => {
  it("defaults to local mode", () => {
    expect(getConfiguredStorageMode({})).toBe("local");
  });

  it("uses configured firebase mode", () => {
    expect(
      getConfiguredStorageMode({
        NEXT_PUBLIC_ENDOGUIDE_STORAGE_MODE: "firebase"
      })
    ).toBe("firebase");
  });

  it("falls back to a local provider when firebase config is incomplete", () => {
    const provider = createStorageProvider("firebase");
    expect(provider.mode).toBe("local");
  });
});
