import type { StorageProvider } from "@/lib/storage";
import type { Appointment, MedicalDocument, TimelineEvent } from "@/lib/domain";

type TimelineCreateInput = Omit<TimelineEvent, "id" | "createdAt" | "updatedAt">;

export function buildTimelineEventForAppointment(input: {
  userId: string;
  appointment: Pick<Appointment, "id" | "scheduledAt" | "clinicianName" | "clinicName" | "reason">;
}): TimelineCreateInput {
  const clinician = input.appointment.clinicianName || "clinician";
  const clinic = input.appointment.clinicName ? ` at ${input.appointment.clinicName}` : "";

  return {
    userId: input.userId,
    occurredAt: input.appointment.scheduledAt ?? new Date().toISOString(),
    eventType: "appointment",
    title: `Appointment with ${clinician}`,
    description: `${input.appointment.reason || "Appointment recorded"}${clinic}.`,
    sourceCollection: "appointments",
    sourceId: input.appointment.id
  };
}

export function buildTimelineEventForDocument(input: {
  userId: string;
  document: Pick<MedicalDocument, "id" | "fileName" | "documentType" | "documentDate" | "uploadedAt">;
}): TimelineCreateInput {
  return {
    userId: input.userId,
    occurredAt: input.document.documentDate ?? input.document.uploadedAt,
    eventType: documentTypeToTimelineType(input.document.documentType),
    title: `${input.document.documentType}: ${input.document.fileName}`,
    description: "Medical document metadata saved in the document vault.",
    sourceCollection: "medicalDocuments",
    sourceId: input.document.id
  };
}

export async function createTimelineEventForSymptom(
  storage: StorageProvider,
  input: {
    userId: string;
    symptomId: string;
    occurredAt: string;
    painScore?: number;
  }
) {
  await storage.timelineEvents.create({
    userId: input.userId,
    occurredAt: input.occurredAt,
    eventType: "symptom",
    title: "Symptom entry",
    description:
      input.painScore == null
        ? "Daily symptom check-in recorded."
        : `Daily symptom check-in recorded with pain score ${input.painScore}/10.`,
    sourceCollection: "symptomEntries",
    sourceId: input.symptomId
  });
}

export async function createTimelineEventForTreatment(
  storage: StorageProvider,
  input: {
    userId: string;
    treatmentId: string;
    name: string;
    startDate?: string;
  }
) {
  await storage.timelineEvents.create({
    userId: input.userId,
    occurredAt: input.startDate ?? new Date().toISOString(),
    eventType: "treatment",
    title: `Treatment recorded: ${input.name}`,
    description: "User-entered treatment history item recorded for organization only.",
    sourceCollection: "treatmentEntries",
    sourceId: input.treatmentId
  });
}

export async function createTimelineEventForAppointment(
  storage: StorageProvider,
  input: Parameters<typeof buildTimelineEventForAppointment>[0]
) {
  await storage.timelineEvents.create(buildTimelineEventForAppointment(input));
}

export async function createTimelineEventForDocument(
  storage: StorageProvider,
  input: Parameters<typeof buildTimelineEventForDocument>[0]
) {
  await storage.timelineEvents.create(buildTimelineEventForDocument(input));
}

function documentTypeToTimelineType(documentType: MedicalDocument["documentType"]): TimelineEvent["eventType"] {
  if (documentType === "Blood Test" || documentType === "Ultrasound" || documentType === "MRI") return "test";
  if (documentType === "Surgery Report") return "procedure";
  if (documentType === "Clinic Letter" || documentType === "Referral") return "report";
  return "document";
}
