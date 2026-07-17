export type ISODateString = string;
export type StorageMode = "firebase" | "emulator" | "local";

export type BaseDocument = {
  id: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  schemaVersion?: number;
  encryptedFields?: string[];
};

export type UserOwnedDocument = BaseDocument & {
  userId: string;
};

export type User = BaseDocument & {
  displayName?: string;
  email?: string;
  lastLoginAt?: ISODateString;
};

export type PatientProfile = UserOwnedDocument & {
  preferredName?: string;
  birthYear?: number;
  countryOrRegion?: string;
  knownConditionsText?: string;
  careTeamNotes?: string;
  emergencyContactOptional?: string;
};

export type SymptomEntry = UserOwnedDocument & {
  occurredAt: ISODateString;
  symptomTypes: string[];
  severity?: number;
  painScore?: number;
  painLocations?: Array<
    "pelvic" | "abdomen" | "lower-back" | "legs" | "bowel" | "bladder" | "other"
  >;
  bodyLocations?: string[];
  bleedingSeverity?: "none" | "spotting" | "light" | "moderate" | "heavy";
  periodStatus?: "not-period" | "period" | "pre-period" | "post-period" | "unknown";
  cycleDay?: number;
  fatigue?: number;
  nausea?: number;
  mood?: "very-low" | "low" | "neutral" | "good" | "very-good";
  sleepQuality?: number;
  bowelSymptoms?: string[];
  bladderSymptoms?: string[];
  painDuringSex?: "none" | "mild" | "moderate" | "severe" | "not-applicable";
  painAfterSex?: "none" | "mild" | "moderate" | "severe" | "not-applicable";
  workImpact?: "none" | "mild" | "moderate" | "severe" | "not-applicable";
  schoolImpact?: "none" | "mild" | "moderate" | "severe" | "not-applicable";
  exerciseImpact?: "none" | "mild" | "moderate" | "severe" | "not-applicable";
  triggers?: string[];
  reliefMethods?: string[];
  freeTextNotes?: string;
  cycleContext?: string;
  tags?: string[];
};

export type TreatmentEntry = UserOwnedDocument & {
  name: string;
  category:
    | "medication"
    | "hormonal-therapy"
    | "surgery"
    | "physiotherapy"
    | "pelvic-floor-therapy"
    | "lifestyle"
    | "nutrition"
    | "procedure"
    | "therapy"
    | "other";
  startDate?: ISODateString;
  endDate?: ISODateString;
  outcome?: string;
  sideEffects?: string;
  reasonStopped?: string;
  doctor?: string;
  clinic?: string;
  notes?: string;
  prescribingClinicianOptional?: string;
};

export type MedicationLog = UserOwnedDocument & {
  medicationName: string;
  recordedAt: ISODateString;
  doseText?: string;
  frequencyText?: string;
  reasonText?: string;
  notes?: string;
};

export type Appointment = UserOwnedDocument & {
  scheduledAt?: ISODateString;
  clinicianName?: string;
  clinicName?: string;
  reason?: string;
  status?: "upcoming" | "completed" | "cancelled";
  questions: string[];
  notes?: string;
  followUps?: string[];
  preparationFields?: {
    goals?: string;
    concerns?: string;
    medicationsToMention?: string;
    documentsToBring?: string;
  };
  preparationSummaryId?: string;
};

export type MedicalDocument = UserOwnedDocument & {
  fileName: string;
  contentType?: string;
  fileSizeBytes?: number;
  storagePath?: string;
  fileReference?: string;
  storageMode: StorageMode;
  uploadedAt: ISODateString;
  documentDate?: ISODateString;
  documentType:
    | "MRI"
    | "Ultrasound"
    | "Blood Test"
    | "Surgery Report"
    | "Referral"
    | "Prescription"
    | "Clinic Letter"
    | "Insurance"
    | "Other";
  sourceType?: "lab" | "imaging" | "visit-note" | "operative-report" | "insurance" | "other";
  notes?: string;
  categories?: string[];
  tags?: string[];
  extractedTextStatus?: "not-started" | "pending" | "complete" | "failed";
};

export type DocumentTag = UserOwnedDocument & {
  name: string;
  color?: string;
  description?: string;
};

export const REPORT_TYPES = [
  "patient-summary",
  "doctor-visit",
  "research-summary",
  "symptom-trend",
  "quality-of-life"
] as const;

export type ReportType = (typeof REPORT_TYPES)[number];

export type ReportSection = {
  heading: string;
  body: string;
  items?: string[];
};

export type DoctorReport = UserOwnedDocument & {
  reportType: ReportType;
  title: string;
  generatedAt: ISODateString;
  dateRange?: { start?: ISODateString; end?: ISODateString };
  sections: ReportSection[];
  sourceRecordIds?: string[];
  disclaimerIncluded: boolean;
  generatorVersion?: string;
};

export type TimelineEvent = UserOwnedDocument & {
  occurredAt: ISODateString;
  eventType:
    | "symptom"
    | "treatment"
    | "medication"
    | "appointment"
    | "procedure"
    | "test"
    | "report"
    | "document"
    | "flare-up"
    | "note"
    | "other";
  title: string;
  description?: string;
  sourceCollection?: string;
  sourceId?: string;
};

export type ResearchNote = UserOwnedDocument & {
  title: string;
  body?: string;
  sourceIds?: string[];
  entityIds?: string[];
  tags?: string[];
};

export type ResearchSource = UserOwnedDocument & {
  title: string;
  authors?: string[];
  journalOrPublisher?: string;
  publishedAt?: ISODateString;
  url?: string;
  doi?: string;
  abstract?: string;
  sourceType?: "paper" | "guideline" | "article" | "book" | "other";
};

export type BiologicalEntity = BaseDocument & {
  name: string;
  entityType: "gene" | "protein" | "hormone" | "pathway" | "condition" | "anatomy" | "other";
  aliases?: string[];
  description?: string;
  sourceIds?: string[];
};

export type EntityRelationship = BaseDocument & {
  sourceEntityId: string;
  targetEntityId: string;
  relationshipType: string;
  evidenceSummary?: string;
  sourceIds?: string[];
  confidenceLabel?: "low" | "moderate" | "high" | "unknown";
};

export type GuidelineSnippet = BaseDocument & {
  title: string;
  organization?: string;
  publishedAt?: ISODateString;
  url?: string;
  topic?: string;
  snippet: string;
  sourceCitation?: string;
};

export type AIInteractionLog = UserOwnedDocument & {
  feature: string;
  provider?: string;
  model?: string;
  safetyClassification:
    | "allowed"
    | "blocked-treatment-advice"
    | "blocked-diagnosis"
    | "blocked-medication"
    | "blocked-surgery"
    | "needs-review";
  blocked: boolean;
  disclaimerIncluded: boolean;
  tokenUsage?: { input?: number; output?: number; total?: number };
  promptStored: boolean;
  responseStored: boolean;
};

export type UserSettings = UserOwnedDocument & {
  theme?: "light" | "dark" | "system";
  locale?: string;
  storageModePreference?: StorageMode;
  aiConsentSettings?: {
    allowRemoteAI: boolean;
    allowPromptStorage: boolean;
  };
  notificationPreferences?: Record<string, boolean>;
};

export type AuditLog = UserOwnedDocument & {
  eventType: string;
  actorId?: string;
  targetCollection?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
};
