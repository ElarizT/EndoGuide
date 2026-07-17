import { describe, expect, it } from "vitest";
import type {
  Appointment,
  MedicalDocument,
  MedicationLog,
  PatientProfile,
  ResearchNote,
  SymptomEntry,
  TreatmentEntry
} from "@/lib/domain";
import {
  generateDoctorVisit,
  generatePatientSummary,
  generateQualityOfLife,
  generateResearchSummary,
  generateSymptomTrend
} from ".";

const base = {
  userId: "report-user",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z"
};

const symptom: SymptomEntry = {
  ...base,
  id: "symptom-1",
  occurredAt: "2026-01-05T12:00:00.000Z",
  symptomTypes: ["pelvic"],
  painScore: 6,
  painLocations: ["pelvic"],
  fatigue: 3,
  nausea: 1,
  sleepQuality: 2,
  mood: "low",
  workImpact: "moderate",
  exerciseImpact: "mild",
  freeTextNotes: "User-recorded note"
};

const treatment: TreatmentEntry = {
  ...base,
  id: "treatment-1",
  name: "Recorded therapy",
  category: "physiotherapy",
  startDate: "2025-12-01T12:00:00.000Z",
  outcome: "User-recorded outcome"
};

const medication: MedicationLog = {
  ...base,
  id: "medication-1",
  medicationName: "Recorded medication",
  recordedAt: "2026-01-04T12:00:00.000Z",
  doseText: "As recorded"
};

const appointment: Appointment = {
  ...base,
  id: "appointment-1",
  scheduledAt: "2026-01-10T12:00:00.000Z",
  clinicianName: "Dr. Example",
  reason: "Review records",
  questions: ["Which records should we discuss?"]
};

const document: MedicalDocument = {
  ...base,
  id: "document-1",
  fileName: "clinic-letter.pdf",
  storageMode: "local",
  uploadedAt: "2026-01-03T12:00:00.000Z",
  documentType: "Clinic Letter"
};

const profile: PatientProfile = {
  ...base,
  id: "profile-1",
  preferredName: "Demo Patient",
  birthYear: 1990
};

const researchNote: ResearchNote = {
  ...base,
  id: "research-note-1",
  title: "Stored evidence note",
  body: "A user-saved research observation.",
  tags: ["evidence"]
};

describe("deterministic report generators", () => {
  it("generates all five report types from only their supported stored records", () => {
    const patient = generatePatientSummary({
      patientProfiles: [profile],
      symptoms: [symptom],
      treatments: [treatment],
      medicationLogs: [medication],
      appointments: [appointment],
      documents: [document]
    });
    const visit = generateDoctorVisit({
      symptoms: [symptom],
      treatments: [treatment],
      medicationLogs: [medication],
      appointments: [appointment],
      documents: [document]
    });
    const trend = generateSymptomTrend({ symptoms: [symptom] });
    const quality = generateQualityOfLife({ symptoms: [symptom] });
    const research = generateResearchSummary({ researchNotes: [researchNote], symptoms: [symptom] });

    expect([patient.reportType, visit.reportType, research.reportType, trend.reportType, quality.reportType]).toEqual([
      "patient-summary",
      "doctor-visit",
      "research-summary",
      "symptom-trend",
      "quality-of-life"
    ]);
    expect(patient.sourceRecordIds).toEqual([
      "appointment-1",
      "document-1",
      "medication-1",
      "profile-1",
      "symptom-1",
      "treatment-1"
    ]);
    expect(research.sourceRecordIds).toEqual(["research-note-1"]);
    expect(JSON.stringify(research.sections)).not.toContain("User-recorded note");
  });

  it("returns identical content for identical inputs", () => {
    expect(generateSymptomTrend({ symptoms: [symptom] })).toEqual(
      generateSymptomTrend({ symptoms: [symptom] })
    );
  });

  it("uses descriptive safety boundaries without conclusions or advice", () => {
    const outputs = [
      generatePatientSummary({ symptoms: [symptom] }),
      generateDoctorVisit({ symptoms: [symptom] }),
      generateSymptomTrend({ symptoms: [symptom] }),
      generateQualityOfLife({ symptoms: [symptom] }),
      generateResearchSummary({ researchNotes: [researchNote] })
    ];
    const generatedText = JSON.stringify(outputs.map((output) => output.sections));

    expect(generatedText).not.toMatch(/\b(you should|we recommend|caused by|indicates that|proves that)\b/i);
    expect(generatedText).not.toMatch(/\b(start|stop|change) your medication\b/i);
    expect(generatedText).not.toMatch(/\b(need|avoid) surgery\b/i);
  });
});
