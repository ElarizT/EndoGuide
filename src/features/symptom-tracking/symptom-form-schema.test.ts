import { describe, expect, it } from "vitest";
import { buildSymptomEntryInput } from "./symptom-service";

describe("symptom validation", () => {
  it("builds a valid symptom entry from form values", () => {
    const entry = buildSymptomEntryInput("demo-user", {
      date: "2026-06-05",
      painScore: 6,
      painLocations: ["pelvic", "lower-back"],
      bleedingSeverity: "light",
      periodStatus: "period",
      cycleDay: 3,
      fatigue: 2,
      nausea: 1,
      mood: "neutral",
      sleepQuality: 3,
      bowelSymptoms: "bloating, constipation",
      bladderSymptoms: "",
      painDuringSex: "not-applicable",
      painAfterSex: "not-applicable",
      workImpact: "mild",
      schoolImpact: "not-applicable",
      exerciseImpact: "moderate",
      triggers: "stress",
      reliefMethods: "heat pad",
      freeTextNotes: "Fictional test entry"
    });

    expect(entry.userId).toBe("demo-user");
    expect(entry.painScore).toBe(6);
    expect(entry.bowelSymptoms).toEqual(["bloating", "constipation"]);
  });

  it("rejects pain scores outside 0-10", () => {
    expect(() =>
      buildSymptomEntryInput("demo-user", {
        date: "2026-06-05",
        painScore: 11,
        painLocations: [],
        bleedingSeverity: "none",
        periodStatus: "unknown",
        cycleDay: "",
        fatigue: 0,
        nausea: 0,
        mood: "neutral",
        sleepQuality: 0,
        bowelSymptoms: "",
        bladderSymptoms: "",
        painDuringSex: "not-applicable",
        painAfterSex: "not-applicable",
        workImpact: "none",
        schoolImpact: "not-applicable",
        exerciseImpact: "none",
        triggers: "",
        reliefMethods: "",
        freeTextNotes: ""
      })
    ).toThrow();
  });
});
