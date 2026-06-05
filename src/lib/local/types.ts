export type LocalStoreName =
  | "patientProfiles"
  | "symptomEntries"
  | "treatmentEntries"
  | "medicationLogs"
  | "appointments"
  | "medicalDocuments"
  | "documentBlobs"
  | "documentTags"
  | "doctorReports"
  | "timelineEvents"
  | "researchNotes"
  | "researchSources"
  | "biologicalEntities"
  | "entityRelationships"
  | "guidelineSnippets"
  | "aiInteractionLogs"
  | "userSettings"
  | "auditLogs";

export type LocalUserSession = {
  id: string;
  mode: "local";
  createdAt: string;
};
