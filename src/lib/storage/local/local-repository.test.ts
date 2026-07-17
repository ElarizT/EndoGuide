import { describe, expect, it } from "vitest";
import { createLocalStorageProvider } from ".";

describe("local storage adapter repositories", () => {
  it("creates, lists, updates, and deletes through the repository interface", async () => {
    const provider = createLocalStorageProvider();
    const created = await provider.symptomEntries.create({
      userId: "repo-test-user",
      occurredAt: "2026-06-05T12:00:00.000Z",
      symptomTypes: ["pelvic"],
      severity: 4,
      painScore: 4,
      painLocations: ["pelvic"]
    });

    expect(created.id).toBeTruthy();
    expect(await provider.symptomEntries.getById(created.id, "repo-test-user")).toMatchObject({ painScore: 4 });

    const listed = await provider.symptomEntries.listByUser("repo-test-user");
    expect(listed.some((entry) => entry.id === created.id)).toBe(true);

    const updated = await provider.symptomEntries.update(created.id, "repo-test-user", { painScore: 5, severity: 5 });
    expect(updated.painScore).toBe(5);

    await provider.symptomEntries.delete(created.id, "repo-test-user");
    expect(await provider.symptomEntries.getById(created.id, "repo-test-user")).toBeNull();
  });

  it("does not expose records to a different local user", async () => {
    const provider = createLocalStorageProvider();
    const created = await provider.symptomEntries.create({
      userId: "owner",
      occurredAt: "2026-06-05T12:00:00.000Z",
      symptomTypes: [],
      painScore: 4
    });

    expect(await provider.symptomEntries.getById(created.id, "other-user")).toBeNull();
    await expect(
      provider.symptomEntries.update(created.id, "other-user", { painScore: 8 })
    ).rejects.toThrow("was not found");
    await expect(provider.symptomEntries.delete(created.id, "other-user")).rejects.toThrow(
      "was not found"
    );
  });
});
