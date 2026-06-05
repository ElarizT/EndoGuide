import type {
  Appointment,
  MedicalDocument,
  SymptomEntry,
  TimelineEvent,
  TreatmentEntry
} from "@/lib/domain";
import { renderDisclaimerHtml, renderMedicalDisclaimer } from "./disclaimer";

export type AppointmentPreparationData = {
  appointment: Appointment;
  symptoms: SymptomEntry[];
  treatments: TreatmentEntry[];
  documents: MedicalDocument[];
  timelineEvents: TimelineEvent[];
};

export type AppointmentPreparationOutput = {
  title: string;
  sections: Array<{ heading: string; body: string; items?: string[] }>;
  html: string;
  markdown: string;
  printableHtml: string;
};

export function generateAppointmentPreparation(
  data: AppointmentPreparationData
): AppointmentPreparationOutput {
  const sections = [
    appointmentSummary(data),
    topSymptoms(data.symptoms),
    mostSevereSymptoms(data.symptoms),
    treatmentHistorySummary(data.treatments),
    qualityOfLifeImpact(data.symptoms),
    questionsToAsk(data),
    referralDiscussionTopics(data),
    documentChecklist(data.documents, data.appointment),
    timelineSummary(data.timelineEvents),
    patientNarrative(data)
  ];
  const title = `Appointment Preparation: ${formatDate(data.appointment.scheduledAt)}`;
  const markdown = renderMarkdown(title, sections);
  const html = renderHtml(title, sections, false);

  return {
    title,
    sections,
    html,
    markdown,
    printableHtml: renderHtml(title, sections, true)
  };
}

function appointmentSummary(data: AppointmentPreparationData) {
  const appointment = data.appointment;
  return {
    heading: "Appointment Summary",
    body: [
      `Date: ${formatDate(appointment.scheduledAt)}`,
      `Doctor: ${appointment.clinicianName || "Not recorded"}`,
      `Clinic: ${appointment.clinicName || "Not recorded"}`,
      `Reason: ${appointment.reason || "Not recorded"}`,
      `Goals: ${appointment.preparationFields?.goals || "Not recorded"}`
    ].join("\n")
  };
}

function topSymptoms(symptoms: SymptomEntry[]) {
  const counts = new Map<string, number>();
  for (const symptom of symptoms) {
    for (const type of symptom.symptomTypes.length ? symptom.symptomTypes : symptom.painLocations ?? []) {
      counts.set(labelize(type), (counts.get(labelize(type)) ?? 0) + 1);
    }
  }
  const items = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => `${name}: ${count} entries`);
  return {
    heading: "Top Symptoms",
    body: items.length ? "Most frequently recorded symptom areas." : "No symptom entries recorded yet.",
    items
  };
}

function mostSevereSymptoms(symptoms: SymptomEntry[]) {
  const items = [...symptoms]
    .sort((a, b) => (b.painScore ?? b.severity ?? 0) - (a.painScore ?? a.severity ?? 0))
    .slice(0, 5)
    .map((symptom) => `${formatDate(symptom.occurredAt)}: pain ${symptom.painScore ?? symptom.severity ?? "n/a"}/10, ${(symptom.painLocations ?? []).map(labelize).join(", ") || "no location recorded"}`);
  return {
    heading: "Most Severe Symptoms",
    body: items.length ? "Highest recorded pain/severity entries." : "No symptom severity records available.",
    items
  };
}

function treatmentHistorySummary(treatments: TreatmentEntry[]) {
  const items = treatments
    .slice()
    .sort((a, b) => (b.startDate ?? b.createdAt).localeCompare(a.startDate ?? a.createdAt))
    .map((treatment) => `${treatment.name} (${labelize(treatment.category)}), ${formatDate(treatment.startDate)}${treatment.endDate ? ` to ${formatDate(treatment.endDate)}` : " to present"}${treatment.outcome ? `; outcome: ${treatment.outcome}` : ""}`);
  return {
    heading: "Treatment History Summary",
    body: items.length ? "User-entered treatment history for discussion." : "No treatment history recorded yet.",
    items
  };
}

function qualityOfLifeImpact(symptoms: SymptomEntry[]) {
  const impacts = symptoms.flatMap((symptom) => [
    symptom.workImpact ? `Work: ${symptom.workImpact}` : "",
    symptom.schoolImpact ? `School: ${symptom.schoolImpact}` : "",
    symptom.exerciseImpact ? `Exercise: ${symptom.exerciseImpact}` : "",
    symptom.sleepQuality != null ? `Sleep quality: ${symptom.sleepQuality}/5` : ""
  ]).filter(Boolean);
  return {
    heading: "Quality of Life Impact",
    body: impacts.length ? "Recent user-recorded impacts." : "No quality-of-life impacts recorded yet.",
    items: impacts.slice(0, 10)
  };
}

function questionsToAsk(data: AppointmentPreparationData) {
  const base = data.appointment.questions.length
    ? data.appointment.questions
    : [
        "What patterns in my symptom history are important to discuss?",
        "Which records would be most useful for follow-up?",
        "Are there symptoms or changes I should track before the next visit?"
      ];
  return {
    heading: "Questions To Ask",
    body: "Questions are prompts for discussion with a qualified healthcare professional.",
    items: base
  };
}

function referralDiscussionTopics(data: AppointmentPreparationData) {
  const topics = [
    data.appointment.preparationFields?.concerns ? `Concerns: ${data.appointment.preparationFields.concerns}` : "",
    "Whether referral to an appropriate specialist is relevant to discuss.",
    "Which documents or test results should be shared with another clinician."
  ].filter(Boolean);
  return {
    heading: "Referral Discussion Topics",
    body: "Discussion prompts only; this does not recommend a referral.",
    items: topics
  };
}

function documentChecklist(documents: MedicalDocument[], appointment: Appointment) {
  const recorded = documents.map((document) => `${document.documentType}: ${document.fileName}`);
  const manual = appointment.preparationFields?.documentsToBring
    ?.split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean) ?? [];
  return {
    heading: "Document Checklist",
    body: recorded.length || manual.length ? "Documents to consider bringing or discussing." : "No documents recorded yet.",
    items: [...manual, ...recorded]
  };
}

function timelineSummary(events: TimelineEvent[]) {
  const items = events
    .slice()
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, 12)
    .map((event) => `${formatDate(event.occurredAt)}: ${event.title}`);
  return {
    heading: "Timeline Summary",
    body: items.length ? "Recent chronological records across EndoGuide." : "No timeline events recorded yet.",
    items
  };
}

function patientNarrative(data: AppointmentPreparationData) {
  const symptoms = data.symptoms.length;
  const treatments = data.treatments.length;
  const docs = data.documents.length;
  return {
    heading: "Patient Narrative",
    body: `I am preparing for ${formatDate(data.appointment.scheduledAt)}${data.appointment.clinicianName ? ` with ${data.appointment.clinicianName}` : ""}. My records currently include ${symptoms} symptom entries, ${treatments} treatment history entries, and ${docs} documents. My appointment goal is: ${data.appointment.preparationFields?.goals || data.appointment.reason || "to discuss my symptoms and records"}.`
  };
}

function renderMarkdown(title: string, sections: AppointmentPreparationOutput["sections"]) {
  const body = sections.map((section) => {
    const items = section.items?.length ? `\n${section.items.map((item) => `- ${item}`).join("\n")}` : "";
    return `## ${section.heading}\n${section.body}${items}`;
  }).join("\n\n");
  return `# ${title}\n\n${body}\n\n${renderMedicalDisclaimer()}`;
}

function renderHtml(title: string, sections: AppointmentPreparationOutput["sections"], printable: boolean) {
  const sectionHtml = sections.map((section) => {
    const items = section.items?.length
      ? `<ul>${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
      : "";
    return `<section><h2>${escapeHtml(section.heading)}</h2><p>${escapeHtml(section.body).replace(/\n/g, "<br />")}</p>${items}</section>`;
  }).join("");
  return `<!doctype html><html><head><meta charset="utf-8" /><title>${escapeHtml(title)}</title>${printable ? "<style>body{font-family:Arial,sans-serif;line-height:1.5;margin:32px}.medical-disclaimer{border-top:1px solid #ccc;padding-top:16px;color:#555}</style>" : ""}</head><body><h1>${escapeHtml(title)}</h1>${sectionHtml}${renderDisclaimerHtml()}${printable ? "<p>PDF export: TODO.</p>" : ""}</body></html>`;
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleDateString() : "Not scheduled";
}

function labelize(value: string) {
  return value.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
