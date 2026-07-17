"use client";

import type {
  Appointment,
  MedicalDocument,
  MedicationLog,
  ResearchNote,
  SymptomEntry,
  TreatmentEntry
} from "@/lib/domain";
import type { StorageProvider } from "@/lib/storage";
import { generateReport } from "./generators";
import { reportCreationSchema, type ReportCreationValues } from "./report-form-schema";
import type { ReportDateRange, ReportSourceData } from "./report-types";

function toDateRange(values: ReportCreationValues): ReportDateRange | undefined {
  if (!values.startDate && !values.endDate) return undefined;
  const range: ReportDateRange = {};
  if (values.startDate) range.start = `${values.startDate}T00:00:00.000Z`;
  if (values.endDate) range.end = `${values.endDate}T23:59:59.999Z`;
  return range;
}

function withinRange(value: string | undefined, range?: ReportDateRange) {
  if (!value) return true;
  if (range?.start && value < range.start) return false;
  if (range?.end && value > range.end) return false;
  return true;
}

export async function createReport(
  storage: StorageProvider,
  userId: string,
  values: ReportCreationValues
) {
  const parsed = reportCreationSchema.parse(values);
  const dateRange = toDateRange(parsed);
  const sourceData = await loadReportSourceData(storage, userId, parsed.reportType, dateRange);
  const generated = generateReport({ reportType: parsed.reportType, dateRange }, sourceData);

  return storage.doctorReports.create({
    userId,
    reportType: generated.reportType,
    title: generated.title,
    generatedAt: new Date().toISOString(),
    ...(generated.dateRange ? { dateRange: generated.dateRange } : {}),
    sections: generated.sections,
    sourceRecordIds: generated.sourceRecordIds,
    disclaimerIncluded: generated.disclaimerIncluded,
    generatorVersion: generated.generatorVersion
  });
}

export async function loadReportSourceData(
  storage: StorageProvider,
  userId: string,
  reportType: ReportCreationValues["reportType"],
  dateRange?: ReportDateRange
): Promise<ReportSourceData> {
  if (reportType === "research-summary") {
    const notes = await storage.researchNotes.listByUser(userId);
    return { researchNotes: filterResearchNotes(notes, dateRange) };
  }

  if (reportType === "symptom-trend" || reportType === "quality-of-life") {
    const symptoms = await storage.symptomEntries.listByUser(userId);
    return { symptoms: filterSymptoms(symptoms, dateRange) };
  }

  const [symptoms, treatments, medicationLogs, appointments, documents] = await Promise.all([
    storage.symptomEntries.listByUser(userId),
    storage.treatmentEntries.listByUser(userId),
    storage.medicationLogs.listByUser(userId),
    storage.appointments.listByUser(userId),
    storage.medicalDocuments.listByUser(userId)
  ]);

  const common = {
    symptoms: filterSymptoms(symptoms, dateRange),
    treatments: filterTreatments(treatments, dateRange),
    medicationLogs: filterMedicationLogs(medicationLogs, dateRange),
    appointments: filterAppointments(appointments, dateRange),
    documents: filterDocuments(documents, dateRange)
  };

  if (reportType === "doctor-visit") return common;

  return {
    ...common,
    patientProfiles: await storage.patientProfiles.listByUser(userId)
  };
}

function filterSymptoms(items: SymptomEntry[], range?: ReportDateRange) {
  return items.filter((item) => withinRange(item.occurredAt, range));
}

function filterTreatments(items: TreatmentEntry[], range?: ReportDateRange) {
  return items.filter((item) => withinRange(item.startDate ?? item.createdAt, range));
}

function filterMedicationLogs(items: MedicationLog[], range?: ReportDateRange) {
  return items.filter((item) => withinRange(item.recordedAt, range));
}

function filterAppointments(items: Appointment[], range?: ReportDateRange) {
  return items.filter((item) => withinRange(item.scheduledAt ?? item.createdAt, range));
}

function filterDocuments(items: MedicalDocument[], range?: ReportDateRange) {
  return items.filter((item) => withinRange(item.documentDate ?? item.uploadedAt, range));
}

function filterResearchNotes(items: ResearchNote[], range?: ReportDateRange) {
  return items.filter((item) => withinRange(item.updatedAt, range));
}
