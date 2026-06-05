import { describe, expect, it } from "vitest";
import {
  MEDICAL_OUTPUT_DISCLAIMER,
  TREATMENT_RECOMMENDATION_REFUSAL,
  appendMedicalDisclaimer,
  getSafetyResponseForRequest
} from ".";

describe("safety constants", () => {
  it("keeps the treatment recommendation refusal exact", () => {
    expect(TREATMENT_RECOMMENDATION_REFUSAL).toBe(
      "I can help organize information, summarize evidence, and prepare questions for discussion with a qualified healthcare professional, but I cannot provide medical advice or treatment recommendations."
    );
  });

  it("keeps the medical output disclaimer exact", () => {
    expect(MEDICAL_OUTPUT_DISCLAIMER).toBe(
      "This information is for educational and organizational purposes only and should not be used as medical advice."
    );
  });

  it("returns the exact refusal for treatment advice requests", () => {
    expect(getSafetyResponseForRequest("Which treatment is best for me?")).toBe(
      TREATMENT_RECOMMENDATION_REFUSAL
    );
  });

  it("adds the disclaimer once", () => {
    const output = appendMedicalDisclaimer("A neutral educational summary.");
    expect(output).toContain(MEDICAL_OUTPUT_DISCLAIMER);
    expect(appendMedicalDisclaimer(output)).toBe(output);
  });
});
