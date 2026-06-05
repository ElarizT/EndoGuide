import { describe, expect, it } from "vitest";
import { buildTreatmentEntryInput } from "./treatment-service";

describe("treatment validation", () => {
  it("builds a valid user-entered treatment history record", () => {
    const entry = buildTreatmentEntryInput("demo-user", {
      name: "Fictional treatment",
      category: "pelvic-floor-therapy",
      startDate: "2026-01-01",
      endDate: "",
      outcome: "User-entered outcome note",
      sideEffects: "",
      reasonStopped: "",
      doctor: "Dr. Example",
      clinic: "Example Clinic",
      notes: "For organization only"
    });

    expect(entry.userId).toBe("demo-user");
    expect(entry.category).toBe("pelvic-floor-therapy");
    expect(entry.doctor).toBe("Dr. Example");
  });

  it("requires a treatment name", () => {
    expect(() =>
      buildTreatmentEntryInput("demo-user", {
        name: "",
        category: "other",
        startDate: "",
        endDate: "",
        outcome: "",
        sideEffects: "",
        reasonStopped: "",
        doctor: "",
        clinic: "",
        notes: ""
      })
    ).toThrow();
  });
});
