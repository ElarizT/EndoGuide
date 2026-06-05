import { describe, expect, it } from "vitest";
import { initializeLocalDatabase, localStoreNames } from "./local-db";

describe("local database", () => {
  it("initializes all expected stores", async () => {
    const result = await initializeLocalDatabase();
    expect(result.stores).toEqual(localStoreNames);
    expect(["indexeddb", "memory"]).toContain(result.mode);
  });
});
