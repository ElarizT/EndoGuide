import type { GeneratedReport, ReportSourceData } from "../report-types";
import { cleanStoredText, formatDate, joinRecorded, labelize, uniqueIds } from "./shared";

export function generateDoctorVisit(data: ReportSourceData): GeneratedReport {
  const appointments = (data.appointments ?? []).slice().sort((a, b) => (b.scheduledAt ?? b.createdAt).localeCompare(a.scheduledAt ?? a.createdAt));
  const symptoms = (data.symptoms ?? []).slice().sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const treatments = (data.treatments ?? []).slice().sort((a, b) => (b.startDate ?? b.createdAt).localeCompare(a.startDate ?? a.createdAt));
  const medications = (data.medicationLogs ?? []).slice().sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
  const documents = (data.documents ?? []).slice().sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  const visit = appointments[0];

  return {
    reportType: "doctor-visit",
    title: visit?.scheduledAt ? `Doctor Visit — ${formatDate(visit.scheduledAt)}` : "Doctor Visit",
    disclaimerIncluded: true,
    generatorVersion: "phase-4-v1",
    sourceRecordIds: uniqueIds([
      ...(visit ? [visit.id] : []),
      ...symptoms.map(({ id }) => id),
      ...treatments.map(({ id }) => id),
      ...medications.map(({ id }) => id),
      ...documents.map(({ id }) => id)
    ]),
    sections: [
      {
        heading: "Visit Context",
        body: "Recorded appointment details.",
        items: [
          `Date: ${formatDate(visit?.scheduledAt)}`,
          `Clinician: ${cleanStoredText(visit?.clinicianName)}`,
          `Clinic: ${cleanStoredText(visit?.clinicName)}`,
          `Reason (user-entered): ${cleanStoredText(visit?.reason)}`,
          `Goals (user-entered): ${cleanStoredText(visit?.preparationFields?.goals)}`,
          `Concerns (user-entered): ${cleanStoredText(visit?.preparationFields?.concerns)}`
        ]
      },
      {
        heading: "Recent Recorded Symptoms",
        body: `${symptoms.length} symptom entries are included for organizational review.`,
        items: symptoms.map((entry) => `${formatDate(entry.occurredAt)} — pain ${entry.painScore ?? entry.severity ?? "not recorded"}/10; locations: ${joinRecorded(entry.painLocations?.map(labelize))}; notes (user-entered): ${cleanStoredText(entry.freeTextNotes)}`)
      },
      {
        heading: "Recorded Treatment and Medication History",
        body: "This is stored history and does not recommend starting, stopping, or changing care.",
        items: [
          ...treatments.map((entry) => `${cleanStoredText(entry.name)} (${labelize(entry.category)}); recorded outcome: ${cleanStoredText(entry.outcome)}; recorded side effects: ${cleanStoredText(entry.sideEffects)}`),
          ...medications.map((entry) => `${formatDate(entry.recordedAt)} — ${cleanStoredText(entry.medicationName)}; recorded dose: ${cleanStoredText(entry.doseText)}; recorded frequency: ${cleanStoredText(entry.frequencyText)}`)
        ]
      },
      {
        heading: "Questions and Notes",
        body: "User-entered questions and notes for discussion with a qualified healthcare professional.",
        items: [
          ...(visit?.questions ?? []).map((item) => `Question: ${cleanStoredText(item)}`),
          ...(visit?.notes ? [`Visit note: ${cleanStoredText(visit.notes)}`] : [])
        ]
      },
      {
        heading: "Available Document Records",
        body: `${documents.length} stored document records are listed. File contents are not interpreted.`,
        items: documents.map((entry) => `${formatDate(entry.documentDate ?? entry.uploadedAt)} — ${entry.documentType}: ${cleanStoredText(entry.fileName)}`)
      }
    ]
  };
}
