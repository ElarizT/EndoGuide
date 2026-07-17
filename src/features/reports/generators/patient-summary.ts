import type { GeneratedReport, ReportSourceData } from "../report-types";
import { cleanStoredText, formatDate, joinRecorded, labelize, uniqueIds } from "./shared";

export function generatePatientSummary(data: ReportSourceData): GeneratedReport {
  const profile = data.patientProfiles?.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  const symptoms = data.symptoms ?? [];
  const treatments = data.treatments ?? [];
  const medications = data.medicationLogs ?? [];
  const appointments = data.appointments ?? [];
  const documents = data.documents ?? [];

  return {
    reportType: "patient-summary",
    title: "Patient Summary",
    disclaimerIncluded: true,
    generatorVersion: "phase-4-v1",
    sourceRecordIds: uniqueIds([
      ...(profile ? [profile.id] : []),
      ...symptoms.map(({ id }) => id),
      ...treatments.map(({ id }) => id),
      ...medications.map(({ id }) => id),
      ...appointments.map(({ id }) => id),
      ...documents.map(({ id }) => id)
    ]),
    sections: [
      {
        heading: "Patient Information",
        body: "Stored profile information.",
        items: [
          `Preferred name: ${cleanStoredText(profile?.preferredName)}`,
          `Birth year: ${profile?.birthYear ?? "Not recorded"}`,
          `Country or region: ${cleanStoredText(profile?.countryOrRegion)}`,
          `Known conditions (user-entered): ${cleanStoredText(profile?.knownConditionsText)}`,
          `Care team notes (user-entered): ${cleanStoredText(profile?.careTeamNotes)}`
        ]
      },
      {
        heading: "Symptom Records",
        body: `${symptoms.length} symptom entries are included. These are user-recorded observations.`,
        items: symptoms
          .slice()
          .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
          .map((entry) => `${formatDate(entry.occurredAt)} — pain ${entry.painScore ?? entry.severity ?? "not recorded"}/10; locations: ${joinRecorded(entry.painLocations?.map(labelize))}`)
      },
      {
        heading: "Treatment History",
        body: `${treatments.length} user-entered treatment history entries are included.`,
        items: treatments
          .slice()
          .sort((a, b) => (b.startDate ?? b.createdAt).localeCompare(a.startDate ?? a.createdAt))
          .map((entry) => `${cleanStoredText(entry.name)} (${labelize(entry.category)}), ${formatDate(entry.startDate)}${entry.endDate ? ` to ${formatDate(entry.endDate)}` : " to present"}; recorded outcome: ${cleanStoredText(entry.outcome)}`)
      },
      {
        heading: "Medication Log",
        body: `${medications.length} medication log entries are included as recorded history only.`,
        items: medications
          .slice()
          .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))
          .map((entry) => `${formatDate(entry.recordedAt)} — ${cleanStoredText(entry.medicationName)}; dose: ${cleanStoredText(entry.doseText)}; frequency: ${cleanStoredText(entry.frequencyText)}`)
      },
      {
        heading: "Appointments and Documents",
        body: `${appointments.length} appointments and ${documents.length} document records are included.`,
        items: [
          ...appointments.slice().sort((a, b) => (b.scheduledAt ?? b.createdAt).localeCompare(a.scheduledAt ?? a.createdAt)).map((entry) => `${formatDate(entry.scheduledAt)} — appointment with ${cleanStoredText(entry.clinicianName)}; reason: ${cleanStoredText(entry.reason)}`),
          ...documents.slice().sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)).map((entry) => `${formatDate(entry.documentDate ?? entry.uploadedAt)} — ${entry.documentType}: ${cleanStoredText(entry.fileName)}`)
        ]
      }
    ]
  };
}
