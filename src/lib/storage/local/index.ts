import { LocalDatabase } from "@/lib/local/local-db";
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
import { createLocalReadOnlyRepository, createLocalRepository } from "./generic-repository";

export function createLocalStorageProvider(db = new LocalDatabase()): StorageProvider {
  return {
    mode: "local",
    patientProfiles: createLocalRepository<PatientProfile>(db, "patientProfiles", patientProfileSchema),
    symptomEntries: createLocalRepository<SymptomEntry>(db, "symptomEntries", symptomEntrySchema),
    treatmentEntries: createLocalRepository<TreatmentEntry>(db, "treatmentEntries", treatmentEntrySchema),
    medicationLogs: createLocalRepository<MedicationLog>(db, "medicationLogs", medicationLogSchema),
    appointments: createLocalRepository<Appointment>(db, "appointments", appointmentSchema),
    medicalDocuments: createLocalRepository<MedicalDocument>(db, "medicalDocuments", medicalDocumentSchema),
    documentTags: createLocalRepository<DocumentTag>(db, "documentTags", documentTagSchema),
    doctorReports: createLocalRepository<DoctorReport>(db, "doctorReports", doctorReportSchema),
    timelineEvents: createLocalRepository<TimelineEvent>(db, "timelineEvents", timelineEventSchema),
    researchNotes: createLocalRepository<ResearchNote>(db, "researchNotes", researchNoteSchema),
    researchSources: createLocalRepository<ResearchSource>(db, "researchSources", researchSourceSchema),
    biologicalEntities: createLocalReadOnlyRepository<BiologicalEntity>(db, "biologicalEntities", biologicalEntitySchema),
    entityRelationships: createLocalReadOnlyRepository<EntityRelationship>(db, "entityRelationships", entityRelationshipSchema),
    guidelineSnippets: createLocalReadOnlyRepository<GuidelineSnippet>(db, "guidelineSnippets", guidelineSnippetSchema),
    userSettings: createLocalRepository<UserSettings>(db, "userSettings", userSettingsSchema),
    auditLogs: createLocalRepository<AuditLog>(db, "auditLogs", auditLogSchema),
    aiInteractionLogs: createLocalRepository<AIInteractionLog>(db, "aiInteractionLogs", aiInteractionLogSchema)
  };
}
