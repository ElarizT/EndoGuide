import type { DoctorReport, ReportSection, ReportType } from "@/lib/domain";
import { MEDICAL_OUTPUT_DISCLAIMER, RESEARCH_OUTPUT_DISCLAIMER } from "@/lib/safety";

export type ReportExport = {
  content: string;
  fileName: string;
  mimeType: "text/markdown" | "text/html";
};

const reservedDisclaimers = [MEDICAL_OUTPUT_DISCLAIMER, RESEARCH_OUTPUT_DISCLAIMER];

export function getReportDisclaimer(reportType: ReportType) {
  return reportType === "research-summary"
    ? RESEARCH_OUTPUT_DISCLAIMER
    : MEDICAL_OUTPUT_DISCLAIMER;
}

export function sanitizeReportText(value: string) {
  return reservedDisclaimers.reduce(
    (text, disclaimer) => text.split(disclaimer).join("[standard disclaimer text omitted from stored content]"),
    value
  );
}

function sanitizeSection(section: ReportSection): ReportSection {
  return {
    heading: sanitizeReportText(section.heading),
    body: sanitizeReportText(section.body),
    items: section.items?.map(sanitizeReportText)
  };
}

export function renderReportMarkdown(report: DoctorReport): string {
  const title = sanitizeReportText(report.title);
  const scope = report.dateRange
    ? `\n\nDate range: ${report.dateRange.start?.slice(0, 10) ?? "earliest record"} to ${report.dateRange.end?.slice(0, 10) ?? "latest record"}`
    : "";
  const sections = report.sections.map(sanitizeSection).map((section) => {
    const items = section.items?.length
      ? `\n\n${section.items.map((item) => `- ${item}`).join("\n")}`
      : "";
    return `## ${section.heading}\n\n${section.body}${items}`;
  }).join("\n\n");

  return `# ${title}${scope}\n\n${sections}\n\n---\n\n${getReportDisclaimer(report.reportType)}\n`;
}

export function renderReportHtml(report: DoctorReport, options: { printable?: boolean } = {}): string {
  const title = sanitizeReportText(report.title);
  const scope = report.dateRange
    ? `<p><strong>Date range:</strong> ${escapeHtml(report.dateRange.start?.slice(0, 10) ?? "earliest record")} to ${escapeHtml(report.dateRange.end?.slice(0, 10) ?? "latest record")}</p>`
    : "";
  const sections = report.sections.map(sanitizeSection).map((section) => {
    const items = section.items?.length
      ? `<ul>${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
      : "";
    return `<section><h2>${escapeHtml(section.heading)}</h2><p>${escapeHtml(section.body).replace(/\n/g, "<br />")}</p>${items}</section>`;
  }).join("");
  const printStyles = options.printable
    ? "@page{margin:18mm}body{max-width:800px;margin:0 auto;padding:24px}section{break-inside:avoid}.report-disclaimer{break-inside:avoid}"
    : "body{max-width:900px;margin:32px auto;padding:0 24px}";

  return `<!doctype html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>${escapeHtml(title)}</title><style>body{font-family:Arial,sans-serif;line-height:1.55;color:#172033}h1{font-size:28px}h2{font-size:19px;margin-top:26px}li{margin:6px 0}.report-disclaimer{border-top:1px solid #b8c0cc;margin-top:32px;padding-top:16px;color:#4a5568;font-weight:600}${printStyles}</style></head><body><main><h1>${escapeHtml(title)}</h1>${scope}${sections}<p class="report-disclaimer">${escapeHtml(getReportDisclaimer(report.reportType))}</p></main></body></html>`;
}

export function exportReportMarkdown(report: DoctorReport): ReportExport {
  return {
    content: renderReportMarkdown(report),
    fileName: `${reportFileStem(report)}.md`,
    mimeType: "text/markdown"
  };
}

export function exportReportHtml(report: DoctorReport, printable = false): ReportExport {
  return {
    content: renderReportHtml(report, { printable }),
    fileName: `${reportFileStem(report)}.html`,
    mimeType: "text/html"
  };
}

function reportFileStem(report: DoctorReport) {
  const stem = sanitizeReportText(report.title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return stem || report.reportType;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
