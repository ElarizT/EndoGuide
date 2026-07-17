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
  StorageMode,
  SymptomEntry,
  TimelineEvent,
  TreatmentEntry,
  UserSettings
} from "@/lib/domain";

export type CreateInput<T extends { id: string; createdAt: string; updatedAt: string }> =
  Omit<T, "id" | "createdAt" | "updatedAt"> & Partial<Pick<T, "id" | "createdAt" | "updatedAt">>;

export type Repository<T extends { id: string; userId: string; createdAt: string; updatedAt: string }> = {
  create(input: CreateInput<T>): Promise<T>;
  getById(id: string, userId: string): Promise<T | null>;
  listByUser(userId: string): Promise<T[]>;
  update(id: string, userId: string, updates: Partial<Omit<T, "id" | "createdAt" | "userId">>): Promise<T>;
  delete(id: string, userId: string): Promise<void>;
};

export type ReadOnlyRepository<T extends { id: string; createdAt: string; updatedAt: string }> = {
  getById(id: string): Promise<T | null>;
  listAll(): Promise<T[]>;
};

export type StorageProvider = {
  mode: StorageMode;
  patientProfiles: Repository<PatientProfile>;
  symptomEntries: Repository<SymptomEntry>;
  treatmentEntries: Repository<TreatmentEntry>;
  medicationLogs: Repository<MedicationLog>;
  appointments: Repository<Appointment>;
  medicalDocuments: Repository<MedicalDocument>;
  documentTags: Repository<DocumentTag>;
  doctorReports: Repository<DoctorReport>;
  timelineEvents: Repository<TimelineEvent>;
  researchNotes: Repository<ResearchNote>;
  researchSources: Repository<ResearchSource>;
  biologicalEntities: ReadOnlyRepository<BiologicalEntity>;
  entityRelationships: ReadOnlyRepository<EntityRelationship>;
  guidelineSnippets: ReadOnlyRepository<GuidelineSnippet>;
  userSettings: Repository<UserSettings>;
  auditLogs: Repository<AuditLog>;
  aiInteractionLogs: Repository<AIInteractionLog>;
};
