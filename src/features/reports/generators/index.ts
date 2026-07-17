import type { ReportType } from "@/lib/domain";
import type { GeneratedReport, ReportGenerationRequest, ReportSourceData } from "../report-types";
import { generateDoctorVisit } from "./doctor-visit";
import { generatePatientSummary } from "./patient-summary";
import { generateQualityOfLife } from "./quality-of-life";
import { generateResearchSummary } from "./research-summary";
import { generateSymptomTrend } from "./symptom-trend";

const generators: Record<ReportType, (data: ReportSourceData) => GeneratedReport> = {
  "patient-summary": generatePatientSummary,
  "doctor-visit": generateDoctorVisit,
  "research-summary": generateResearchSummary,
  "symptom-trend": generateSymptomTrend,
  "quality-of-life": generateQualityOfLife
};

export function generateReport(request: ReportGenerationRequest, data: ReportSourceData): GeneratedReport {
  return {
    ...generators[request.reportType](data),
    dateRange: request.dateRange
  };
}

export { generateDoctorVisit } from "./doctor-visit";
export { generatePatientSummary } from "./patient-summary";
export { generateQualityOfLife } from "./quality-of-life";
export { generateResearchSummary } from "./research-summary";
export { generateSymptomTrend } from "./symptom-trend";
