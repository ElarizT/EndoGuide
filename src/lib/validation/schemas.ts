import { z } from "zod";

const isoDate = z.string().datetime({ offset: true });
const id = z.string().min(1);
const baseDocumentSchema = z.object({
  id,
  createdAt: isoDate,
  updatedAt: isoDate,
  schemaVersion: z.number().int().positive().optional(),
  encryptedFields: z.array(z.string()).optional()
});

const userOwnedDocumentSchema = baseDocumentSchema.extend({
  userId: id
});

export const userSchema = baseDocumentSchema.extend({
  displayName: z.string().optional(),
  email: z.string().email().optional(),
  lastLoginAt: isoDate.optional()
});

export const patientProfileSchema = userOwnedDocumentSchema.extend({
  preferredName: z.string().optional(),
  birthYear: z.number().int().min(1900).max(new Date().getUTCFullYear()).optional(),
  countryOrRegion: z.string().optional(),
  knownConditionsText: z.string().optional(),
  careTeamNotes: z.string().optional(),
  emergencyContactOptional: z.string().optional()
});

export const symptomEntrySchema = userOwnedDocumentSchema.extend({
  occurredAt: isoDate,
  symptomTypes: z.array(z.string()).default([]),
  severity: z.number().int().min(0).max(10).optional(),
  painScore: z.number().int().min(0).max(10).optional(),
  painLocations: z.array(z.enum(["pelvic", "abdomen", "lower-back", "legs", "bowel", "bladder", "other"])).optional(),
  bodyLocations: z.array(z.string()).optional(),
  bleedingSeverity: z.enum(["none", "spotting", "light", "moderate", "heavy"]).optional(),
  periodStatus: z.enum(["not-period", "period", "pre-period", "post-period", "unknown"]).optional(),
  cycleDay: z.number().int().min(1).max(120).optional(),
  fatigue: z.number().int().min(0).max(5).optional(),
  nausea: z.number().int().min(0).max(5).optional(),
  mood: z.enum(["very-low", "low", "neutral", "good", "very-good"]).optional(),
  sleepQuality: z.number().int().min(0).max(5).optional(),
  bowelSymptoms: z.array(z.string()).optional(),
  bladderSymptoms: z.array(z.string()).optional(),
  painDuringSex: z.enum(["none", "mild", "moderate", "severe", "not-applicable"]).optional(),
  painAfterSex: z.enum(["none", "mild", "moderate", "severe", "not-applicable"]).optional(),
  workImpact: z.enum(["none", "mild", "moderate", "severe", "not-applicable"]).optional(),
  schoolImpact: z.enum(["none", "mild", "moderate", "severe", "not-applicable"]).optional(),
  exerciseImpact: z.enum(["none", "mild", "moderate", "severe", "not-applicable"]).optional(),
  triggers: z.array(z.string()).optional(),
  reliefMethods: z.array(z.string()).optional(),
  freeTextNotes: z.string().optional(),
  cycleContext: z.string().optional(),
  tags: z.array(z.string()).optional()
});

export const treatmentEntrySchema = userOwnedDocumentSchema.extend({
  name: z.string().min(1),
  category: z.enum([
    "medication",
    "hormonal-therapy",
    "surgery",
    "physiotherapy",
    "pelvic-floor-therapy",
    "lifestyle",
    "nutrition",
    "procedure",
    "therapy",
    "other"
  ]),
  startDate: isoDate.optional(),
  endDate: isoDate.optional(),
  outcome: z.string().optional(),
  sideEffects: z.string().optional(),
  reasonStopped: z.string().optional(),
  doctor: z.string().optional(),
  clinic: z.string().optional(),
  notes: z.string().optional(),
  prescribingClinicianOptional: z.string().optional()
});

export const medicationLogSchema = userOwnedDocumentSchema.extend({
  medicationName: z.string().min(1),
  recordedAt: isoDate,
  doseText: z.string().optional(),
  frequencyText: z.string().optional(),
  reasonText: z.string().optional(),
  notes: z.string().optional()
});

export const appointmentSchema = userOwnedDocumentSchema.extend({
  scheduledAt: isoDate.optional(),
  clinicianName: z.string().optional(),
  clinicName: z.string().optional(),
  reason: z.string().optional(),
  status: z.enum(["upcoming", "completed", "cancelled"]).optional(),
  questions: z.array(z.string()).default([]),
  notes: z.string().optional(),
  followUps: z.array(z.string()).optional(),
  preparationFields: z.object({
    goals: z.string().optional(),
    concerns: z.string().optional(),
    medicationsToMention: z.string().optional(),
    documentsToBring: z.string().optional()
  }).optional(),
  preparationSummaryId: z.string().optional()
});

export const medicalDocumentSchema = userOwnedDocumentSchema.extend({
  fileName: z.string().min(1),
  contentType: z.string().optional(),
  fileSizeBytes: z.number().int().nonnegative().optional(),
  storagePath: z.string().optional(),
  fileReference: z.string().optional(),
  storageMode: z.enum(["firebase", "emulator", "local"]),
  uploadedAt: isoDate,
  documentDate: isoDate.optional(),
  documentType: z.enum([
    "MRI",
    "Ultrasound",
    "Blood Test",
    "Surgery Report",
    "Referral",
    "Prescription",
    "Clinic Letter",
    "Insurance",
    "Other"
  ]),
  sourceType: z.enum(["lab", "imaging", "visit-note", "operative-report", "insurance", "other"]).optional(),
  notes: z.string().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  extractedTextStatus: z.enum(["not-started", "pending", "complete", "failed"]).optional()
});

export const documentTagSchema = userOwnedDocumentSchema.extend({
  name: z.string().min(1),
  color: z.string().optional(),
  description: z.string().optional()
});

export const doctorReportSchema = userOwnedDocumentSchema.extend({
  title: z.string().min(1),
  generatedAt: isoDate,
  dateRange: z.object({ start: isoDate.optional(), end: isoDate.optional() }).optional(),
  sections: z.array(z.object({ heading: z.string(), body: z.string() })).default([]),
  sourceRecordIds: z.array(z.string()).optional(),
  disclaimerIncluded: z.boolean()
});

export const timelineEventSchema = userOwnedDocumentSchema.extend({
  occurredAt: isoDate,
  eventType: z.enum([
    "symptom",
    "treatment",
    "medication",
    "appointment",
    "procedure",
    "test",
    "report",
    "document",
    "flare-up",
    "note",
    "other"
  ]),
  title: z.string().min(1),
  description: z.string().optional(),
  sourceCollection: z.string().optional(),
  sourceId: z.string().optional()
});

export const researchNoteSchema = userOwnedDocumentSchema.extend({
  title: z.string().min(1),
  body: z.string().optional(),
  sourceIds: z.array(z.string()).optional(),
  entityIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional()
});

export const researchSourceSchema = userOwnedDocumentSchema.extend({
  title: z.string().min(1),
  authors: z.array(z.string()).optional(),
  journalOrPublisher: z.string().optional(),
  publishedAt: isoDate.optional(),
  url: z.string().url().optional(),
  doi: z.string().optional(),
  abstract: z.string().optional(),
  sourceType: z.enum(["paper", "guideline", "article", "book", "other"]).optional()
});

export const biologicalEntitySchema = baseDocumentSchema.extend({
  name: z.string().min(1),
  entityType: z.enum(["gene", "protein", "hormone", "pathway", "condition", "anatomy", "other"]),
  aliases: z.array(z.string()).optional(),
  description: z.string().optional(),
  sourceIds: z.array(z.string()).optional()
});

export const entityRelationshipSchema = baseDocumentSchema.extend({
  sourceEntityId: id,
  targetEntityId: id,
  relationshipType: z.string().min(1),
  evidenceSummary: z.string().optional(),
  sourceIds: z.array(z.string()).optional(),
  confidenceLabel: z.enum(["low", "moderate", "high", "unknown"]).optional()
});

export const guidelineSnippetSchema = baseDocumentSchema.extend({
  title: z.string().min(1),
  organization: z.string().optional(),
  publishedAt: isoDate.optional(),
  url: z.string().url().optional(),
  topic: z.string().optional(),
  snippet: z.string().min(1),
  sourceCitation: z.string().optional()
});

export const aiInteractionLogSchema = userOwnedDocumentSchema.extend({
  feature: z.string().min(1),
  provider: z.string().optional(),
  model: z.string().optional(),
  safetyClassification: z.enum([
    "allowed",
    "blocked-treatment-advice",
    "blocked-diagnosis",
    "blocked-medication",
    "blocked-surgery",
    "needs-review"
  ]),
  blocked: z.boolean(),
  disclaimerIncluded: z.boolean(),
  tokenUsage: z.object({
    input: z.number().int().nonnegative().optional(),
    output: z.number().int().nonnegative().optional(),
    total: z.number().int().nonnegative().optional()
  }).optional(),
  promptStored: z.boolean(),
  responseStored: z.boolean()
});

export const userSettingsSchema = userOwnedDocumentSchema.extend({
  theme: z.enum(["light", "dark", "system"]).optional(),
  locale: z.string().optional(),
  storageModePreference: z.enum(["firebase", "emulator", "local"]).optional(),
  aiConsentSettings: z.object({
    allowRemoteAI: z.boolean(),
    allowPromptStorage: z.boolean()
  }).optional(),
  notificationPreferences: z.record(z.boolean()).optional()
});

export const auditLogSchema = userOwnedDocumentSchema.extend({
  eventType: z.string().min(1),
  actorId: z.string().optional(),
  targetCollection: z.string().optional(),
  targetId: z.string().optional(),
  metadata: z.record(z.unknown()).optional()
});

export const domainSchemas = {
  users: userSchema,
  patientProfiles: patientProfileSchema,
  symptomEntries: symptomEntrySchema,
  treatmentEntries: treatmentEntrySchema,
  medicationLogs: medicationLogSchema,
  appointments: appointmentSchema,
  medicalDocuments: medicalDocumentSchema,
  documentTags: documentTagSchema,
  doctorReports: doctorReportSchema,
  timelineEvents: timelineEventSchema,
  researchNotes: researchNoteSchema,
  researchSources: researchSourceSchema,
  biologicalEntities: biologicalEntitySchema,
  entityRelationships: entityRelationshipSchema,
  guidelineSnippets: guidelineSnippetSchema,
  aiInteractionLogs: aiInteractionLogSchema,
  userSettings: userSettingsSchema,
  auditLogs: auditLogSchema
};
