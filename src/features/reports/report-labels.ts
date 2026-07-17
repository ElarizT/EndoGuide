import type { ReportType } from "@/lib/domain";

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  "patient-summary": "Patient Summary",
  "doctor-visit": "Doctor Visit",
  "research-summary": "Research Summary",
  "symptom-trend": "Symptom Trend",
  "quality-of-life": "Quality of Life"
};

export const REPORT_TYPE_DESCRIPTIONS: Record<ReportType, string> = {
  "patient-summary": "Organizes profile, symptom, treatment, medication, appointment, and document records.",
  "doctor-visit": "Organizes recorded visit context, recent symptoms, history, questions, and documents.",
  "research-summary": "Organizes stored research notes only; it does not retrieve or interpret new research.",
  "symptom-trend": "Shows descriptive counts and recorded values without claiming causes or correlations.",
  "quality-of-life": "Summarizes recorded work, school, exercise, sleep, and mood impacts."
};
