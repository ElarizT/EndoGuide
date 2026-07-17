import type { GeneratedReport, ReportSourceData } from "../report-types";
import { average, countLabels, formatDate, uniqueIds } from "./shared";

export function generateSymptomTrend(data: ReportSourceData): GeneratedReport {
  const symptoms = (data.symptoms ?? []).slice().sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  const painValues = symptoms.map((entry) => entry.painScore ?? entry.severity).filter((value): value is number => value != null);
  const locations = symptoms.flatMap((entry) => entry.painLocations ?? []);

  return {
    reportType: "symptom-trend",
    title: "Symptom Trend",
    disclaimerIncluded: true,
    generatorVersion: "phase-4-v1",
    sourceRecordIds: uniqueIds(symptoms.map(({ id }) => id)),
    sections: [
      {
        heading: "Recording Coverage",
        body: symptoms.length
          ? `${symptoms.length} entries from ${formatDate(symptoms[0]?.occurredAt)} to ${formatDate(symptoms.at(-1)?.occurredAt)} are included.`
          : "No symptom entries are included.",
        items: [
          `Entries with recorded pain or severity: ${painValues.length}`,
          `Average recorded pain or severity: ${average(painValues)}${painValues.length ? "/10" : ""}`,
          `Lowest recorded value: ${painValues.length ? Math.min(...painValues) : "Not recorded"}`,
          `Highest recorded value: ${painValues.length ? Math.max(...painValues) : "Not recorded"}`
        ]
      },
      {
        heading: "Recorded Values by Date",
        body: "Chronological user-recorded values. Changes between entries are descriptive only.",
        items: symptoms.map((entry) => `${formatDate(entry.occurredAt)} — pain or severity ${entry.painScore ?? entry.severity ?? "not recorded"}/10; fatigue ${entry.fatigue ?? "not recorded"}/5; nausea ${entry.nausea ?? "not recorded"}/5`)
      },
      {
        heading: "Recorded Symptom Locations",
        body: "Counts show how often each location was recorded.",
        items: countLabels(locations)
      },
      {
        heading: "Interpretation Boundary",
        body: "These descriptive counts do not establish a diagnosis, relationship, correlation, or cause."
      }
    ]
  };
}
