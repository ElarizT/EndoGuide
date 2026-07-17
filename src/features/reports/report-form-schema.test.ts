import { describe, expect, it } from "vitest";
import { reportCreationSchema } from "./report-form-schema";

describe("report creation validation", () => {
  it("accepts each supported report type", () => {
    for (const reportType of ["patient-summary", "doctor-visit", "research-summary", "symptom-trend", "quality-of-life"] as const) {
      expect(reportCreationSchema.parse({ reportType, startDate: "", endDate: "" }).reportType).toBe(reportType);
    }
  });

  it("rejects a reversed date range", () => {
    expect(() => reportCreationSchema.parse({
      reportType: "symptom-trend",
      startDate: "2026-02-02",
      endDate: "2026-01-01"
    })).toThrow("End date must be on or after the start date.");
  });

  it("rejects an impossible calendar date", () => {
    expect(() => reportCreationSchema.parse({
      reportType: "patient-summary",
      startDate: "2026-02-30",
      endDate: ""
    })).toThrow("Use a valid date.");
  });
});
