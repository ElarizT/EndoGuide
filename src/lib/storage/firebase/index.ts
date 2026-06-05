import { getFirebaseServices } from "@/lib/firebase/client";
import type {
  AIInteractionLog,
  Appointment,
  AuditLog,
  BiologicalEntity,
  DoctorReport,
  DocumentTag,
  EntityRelationship,
  GuidelineSnippet,
  MedicalDocument,
  MedicationLog,
  PatientProfile,
  ResearchNote,
  ResearchSource,
  SymptomEntry,
  TimelineEvent,
  TreatmentEntry,
  UserSettings
} from "@/lib/domain";
import {
  aiInteractionLogSchema,
  appointmentSchema,
  auditLogSchema,
  biologicalEntitySchema,
  doctorReportSchema,
  documentTagSchema,
  entityRelationshipSchema,
  guidelineSnippetSchema,
  medicalDocumentSchema,
  medicationLogSchema,
  patientProfileSchema,
  researchNoteSchema,
  researchSourceSchema,
  symptomEntrySchema,
  timelineEventSchema,
  treatmentEntrySchema,
  userSettingsSchema
} from "@/lib/validation";
import type { StorageProvider } from "../types";
import {
  createFirebaseReadOnlyRepository,
  createFirebaseRepository
} from "./generic-repository";

export function createFirebaseStorageProvider(mode: "firebase" | "emulator" = "firebase"): StorageProvider {
  const services = getFirebaseServices();
  if (!services) {
    throw new Error("Firebase storage provider requested, but Firebase config is missing.");
  }

  const db = services.firestore;

  return {
    mode,
    patientProfiles: createFirebaseRepository<PatientProfile>(db, "patientProfiles", patientProfileSchema),
    symptomEntries: createFirebaseRepository<SymptomEntry>(db, "symptomEntries", symptomEntrySchema),
    treatmentEntries: createFirebaseRepository<TreatmentEntry>(db, "treatmentEntries", treatmentEntrySchema),
    medicationLogs: createFirebaseRepository<MedicationLog>(db, "medicationLogs", medicationLogSchema),
    appointments: createFirebaseRepository<Appointment>(db, "appointments", appointmentSchema),
    medicalDocuments: createFirebaseRepository<MedicalDocument>(db, "medicalDocuments", medicalDocumentSchema),
    documentTags: createFirebaseRepository<DocumentTag>(db, "documentTags", documentTagSchema),
    doctorReports: createFirebaseRepository<DoctorReport>(db, "doctorReports", doctorReportSchema),
    timelineEvents: createFirebaseRepository<TimelineEvent>(db, "timelineEvents", timelineEventSchema),
    researchNotes: createFirebaseRepository<ResearchNote>(db, "researchNotes", researchNoteSchema),
    researchSources: createFirebaseRepository<ResearchSource>(db, "researchSources", researchSourceSchema),
    biologicalEntities: createFirebaseReadOnlyRepository<BiologicalEntity>(db, "biologicalEntities", biologicalEntitySchema),
    entityRelationships: createFirebaseReadOnlyRepository<EntityRelationship>(db, "entityRelationships", entityRelationshipSchema),
    guidelineSnippets: createFirebaseReadOnlyRepository<GuidelineSnippet>(db, "guidelineSnippets", guidelineSnippetSchema),
    userSettings: createFirebaseRepository<UserSettings>(db, "userSettings", userSettingsSchema),
    auditLogs: createFirebaseRepository<AuditLog>(db, "auditLogs", auditLogSchema),
    aiInteractionLogs: createFirebaseRepository<AIInteractionLog>(db, "aiInteractionLogs", aiInteractionLogSchema)
  };
}
