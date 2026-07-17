import { describe, expect, it } from "vitest";
import { createLocalStorageProvider } from ".";

describe("local report repository", () => {
  it("persists a validated report and preserves its report type and sections", async () => {
    const provider = createLocalStorageProvider();
    const created = await provider.doctorReports.create({
      userId: "local-report-user",
      reportType: "symptom-trend",
      title: "Symptom Trend",
      generatedAt: "2026-01-01T00:00:00.000Z",
      sections: [{ heading: "Recorded Values", body: "Two entries.", items: ["Pain: 4/10"] }],
      sourceRecordIds: ["symptom-1"],
      disclaimerIncluded: true,
      generatorVersion: "phase-4-v1"
    });

    expect(await provider.doctorReports.getById(created.id, "local-report-user")).toMatchObject({
      reportType: "symptom-trend",
      sections: [{ heading: "Recorded Values", body: "Two entries.", items: ["Pain: 4/10"] }]
    });
    expect(await provider.doctorReports.getById(created.id, "other-user")).toBeNull();
  });
});
