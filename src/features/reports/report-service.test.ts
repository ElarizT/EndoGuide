import { describe, expect, it, vi } from "vitest";
import type { StorageProvider } from "@/lib/storage";
import { loadReportSourceData } from "./report-service";

describe("report source loading", () => {
  it("reads stored research notes only for a Research Summary", async () => {
    const listNotes = vi.fn(async () => [{
      id: "note-1",
      userId: "user-1",
      title: "Stored note",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z"
    }]);
    const listSources = vi.fn(async () => []);
    const listSymptoms = vi.fn(async () => []);
    const storage = {
      researchNotes: { listByUser: listNotes },
      researchSources: { listByUser: listSources },
      symptomEntries: { listByUser: listSymptoms }
    } as unknown as StorageProvider;

    const result = await loadReportSourceData(storage, "user-1", "research-summary");
    expect(result).toEqual({ researchNotes: [expect.objectContaining({ id: "note-1" })] });
    expect(listNotes).toHaveBeenCalledWith("user-1");
    expect(listSources).not.toHaveBeenCalled();
    expect(listSymptoms).not.toHaveBeenCalled();
  });
});
