import type {
  Appointment,
  DoctorReport,
  MedicalDocument,
  ResearchNote,
  SymptomEntry,
  TreatmentEntry
} from "@/lib/domain";

export type DashboardSourceData = {
  symptoms: SymptomEntry[];
  treatments: TreatmentEntry[];
  appointments: Appointment[];
  documents: MedicalDocument[];
  reports: DoctorReport[];
  researchNotes: ResearchNote[];
};

export function getTodayPainScore(symptoms: SymptomEntry[], today = new Date()) {
  const key = today.toISOString().slice(0, 10);
  const entry = symptoms.find((item) => item.occurredAt.slice(0, 10) === key);
  return entry?.painScore ?? entry?.severity ?? null;
}

export function getLatestSymptomEntry(symptoms: SymptomEntry[]) {
  return [...symptoms].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))[0] ?? null;
}

export function getRecentFlareUps(symptoms: SymptomEntry[], minimumPainScore = 7) {
  return [...symptoms]
    .filter((entry) => (entry.painScore ?? entry.severity ?? 0) >= minimumPainScore)
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, 5);
}

export function getUpcomingAppointments(appointments: Appointment[], now = new Date()) {
  return [...appointments]
    .filter((appointment) => appointment.scheduledAt && appointment.scheduledAt >= now.toISOString())
    .sort((a, b) => (a.scheduledAt ?? "").localeCompare(b.scheduledAt ?? ""))
    .slice(0, 3);
}

export function getActiveTreatments(treatments: TreatmentEntry[]) {
  return treatments.filter((entry) => !entry.endDate);
}

export function getPainTrendData(symptoms: SymptomEntry[]) {
  return [...symptoms]
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))
    .slice(-14)
    .map((entry) => ({
      label: entry.occurredAt.slice(5, 10),
      value: entry.painScore ?? entry.severity ?? 0
    }));
}

export function getCycleCorrelationData(symptoms: SymptomEntry[]) {
  const byBucket = new Map<string, number[]>();
  for (const entry of symptoms) {
    if (!entry.cycleDay) continue;
    const bucketStart = Math.floor((entry.cycleDay - 1) / 5) * 5 + 1;
    const label = `${bucketStart}-${bucketStart + 4}`;
    const values = byBucket.get(label) ?? [];
    values.push(entry.painScore ?? entry.severity ?? 0);
    byBucket.set(label, values);
  }

  return Array.from(byBucket.entries()).map(([label, values]) => ({
    label,
    value: Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
  }));
}

export function getTreatmentTimelineData(treatments: TreatmentEntry[]) {
  const byType = new Map<string, number>();
  for (const treatment of treatments) {
    byType.set(treatment.category, (byType.get(treatment.category) ?? 0) + 1);
  }
  return Array.from(byType.entries()).map(([label, value]) => ({
    label: label.replace(/-/g, " "),
    value
  }));
}

export function aggregateDashboardData(data: DashboardSourceData) {
  const symptoms = [...data.symptoms].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

  return {
    todayPainScore: getTodayPainScore(symptoms),
    latestSymptomEntry: getLatestSymptomEntry(symptoms),
    recentFlareUps: getRecentFlareUps(symptoms),
    upcomingAppointments: getUpcomingAppointments(data.appointments),
    activeTreatments: getActiveTreatments(data.treatments),
    uploadedDocumentsCount: data.documents.length,
    generatedReportsCount: data.reports.length,
    researchNotesCount: data.researchNotes.length,
    painTrendData: getPainTrendData(symptoms),
    symptomHeatmapData: getPainTrendData(symptoms).map((item) => ({
      date: item.label,
      value: item.value
    })),
    cycleCorrelationData: getCycleCorrelationData(symptoms),
    treatmentTimelineData: getTreatmentTimelineData(data.treatments)
  };
}
