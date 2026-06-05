import { describe, expect, it } from "vitest";
import {
  appointmentSchema,
  patientProfileSchema,
  symptomEntrySchema,
  treatmentEntrySchema
} from ".";

const baseUserOwned = {
  id: "demo-id",
  userId: "demo-user",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z"
};

describe("domain schemas", () => {
  it("accepts a fictional patient profile", () => {
    expect(
      patientProfileSchema.parse({
        ...baseUserOwned,
        preferredName: "Demo Patient",
        birthYear: 1991
      }).userId
    ).toBe("demo-user");
  });

  it("rejects symptom severity outside the supported range", () => {
    expect(() =>
      symptomEntrySchema.parse({
        ...baseUserOwned,
        occurredAt: "2026-01-01T00:00:00.000Z",
        symptomTypes: ["pelvic pain"],
        severity: 11
      })
    ).toThrow();
  });

  it("requires treatment names", () => {
    expect(() =>
      treatmentEntrySchema.parse({
        ...baseUserOwned,
        name: "",
        category: "other"
      })
    ).toThrow();
  });

  it("defaults appointment questions to an empty list", () => {
    const parsed = appointmentSchema.parse(baseUserOwned);
    expect(parsed.questions).toEqual([]);
  });
});
