import { describe, expect, it } from "vitest";
import { appointmentFormSchema } from "./appointment-form-schema";

describe("appointment validation", () => {
  it("accepts required appointment fields and defaults status", () => {
    const parsed = appointmentFormSchema.parse({
      date: "2026-06-20",
      clinicianName: "Dr Demo"
    });

    expect(parsed.status).toBe("upcoming");
  });

  it("requires an appointment date", () => {
    expect(() => appointmentFormSchema.parse({ date: "" })).toThrow();
  });
});
