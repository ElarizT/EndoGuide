import type { GeneratedReport, ReportSourceData } from "../report-types";
import { average, countLabels, formatDate, uniqueIds } from "./shared";

export function generateQualityOfLife(data: ReportSourceData): GeneratedReport {
  const symptoms = (data.symptoms ?? []).slice().sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));

  const impactItems = (label: string, values: Array<string | undefined>) => {
    const recorded = values.filter((value): value is string => Boolean(value && value !== "not-applicable"));
    return countLabels(recorded).map((item) => `${label} — ${item}`);
  };

  return {
    reportType: "quality-of-life",
    title: "Quality of Life",
    disclaimerIncluded: true,
    generatorVersion: "phase-4-v1",
    sourceRecordIds: uniqueIds(symptoms.map(({ id }) => id)),
    sections: [
      {
        heading: "Recorded Daily-Life Impacts",
        body: `${symptoms.length} symptom entries were reviewed for user-recorded impact fields.`,
        items: [
          ...impactItems("Work", symptoms.map((entry) => entry.workImpact)),
          ...impactItems("School", symptoms.map((entry) => entry.schoolImpact)),
          ...impactItems("Exercise", symptoms.map((entry) => entry.exerciseImpact))
        ]
      },
      {
        heading: "Recorded Sleep and Mood",
        body: "Summary of values explicitly recorded in symptom entries.",
        items: [
          `Average recorded sleep quality: ${average(symptoms.map((entry) => entry.sleepQuality))}${symptoms.some((entry) => entry.sleepQuality != null) ? "/5" : ""}`,
          ...countLabels(symptoms.map((entry) => entry.mood).filter((value): value is NonNullable<typeof value> => Boolean(value))).map((item) => `Mood — ${item}`)
        ]
      },
      {
        heading: "Impact Records by Date",
        body: "Chronological organization of recorded impacts; unrecorded fields are shown as not recorded.",
        items: symptoms.map((entry) => `${formatDate(entry.occurredAt)} — work: ${entry.workImpact ?? "not recorded"}; school: ${entry.schoolImpact ?? "not recorded"}; exercise: ${entry.exerciseImpact ?? "not recorded"}; sleep: ${entry.sleepQuality ?? "not recorded"}/5; mood: ${entry.mood ?? "not recorded"}`)
      },
      {
        heading: "Interpretation Boundary",
        body: "This report organizes self-recorded impacts and does not determine their medical cause."
      }
    ]
  };
}
