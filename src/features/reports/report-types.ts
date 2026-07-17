import type {
  Appointment,
  DoctorReport,
  MedicalDocument,
  MedicationLog,
  PatientProfile,
  ReportSection,
  ReportType,
  ResearchNote,
  SymptomEntry,
  TreatmentEntry
} from "@/lib/domain";

export type ReportDateRange = {
  start?: string;
  end?: string;
};

export type ReportGenerationRequest = {
  reportType: ReportType;
  dateRange?: ReportDateRange;
};

export type ReportSourceData = {
  patientProfiles?: PatientProfile[];
  symptoms?: SymptomEntry[];
  treatments?: TreatmentEntry[];
  medicationLogs?: MedicationLog[];
  appointments?: Appointment[];
  documents?: MedicalDocument[];
  researchNotes?: ResearchNote[];
};

export type GeneratedReport = Pick<
  DoctorReport,
  "reportType" | "title" | "sections" | "sourceRecordIds" | "disclaimerIncluded" | "generatorVersion"
> & {
  dateRange?: ReportDateRange;
};

export type Section = ReportSection;
