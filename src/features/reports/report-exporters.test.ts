import { describe, expect, it } from "vitest";
import type { DoctorReport } from "@/lib/domain";
import { MEDICAL_OUTPUT_DISCLAIMER, RESEARCH_OUTPUT_DISCLAIMER } from "@/lib/safety";
import { exportReportHtml, exportReportMarkdown, renderReportHtml, renderReportMarkdown } from "./report-exporters";

function report(reportType: DoctorReport["reportType"]): DoctorReport {
  return {
    id: "report-1",
    userId: "report-user",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    reportType,
    title: "Example <Report>",
    generatedAt: "2026-01-01T00:00:00.000Z",
    sections: [{
      heading: "Recorded content",
      body: `A stored value. ${MEDICAL_OUTPUT_DISCLAIMER}`,
      items: ["Item <one>"]
    }],
    disclaimerIncluded: true
  };
}

function occurrences(value: string, expected: string) {
  return value.split(expected).length - 1;
}

describe("report exporters", () => {
  it("includes the exact medical disclaimer once in patient-facing Markdown and HTML", () => {
    const markdown = renderReportMarkdown(report("patient-summary"));
    const html = renderReportHtml(report("patient-summary"));
    expect(occurrences(markdown, MEDICAL_OUTPUT_DISCLAIMER)).toBe(1);
    expect(occurrences(html, MEDICAL_OUTPUT_DISCLAIMER)).toBe(1);
    expect(markdown).not.toContain(RESEARCH_OUTPUT_DISCLAIMER);
  });

  it("includes the research disclaimer once and no medical disclaimer in research exports", () => {
    const research = report("research-summary");
    const markdown = renderReportMarkdown(research);
    const html = renderReportHtml(research);
    expect(occurrences(markdown, RESEARCH_OUTPUT_DISCLAIMER)).toBe(1);
    expect(occurrences(html, RESEARCH_OUTPUT_DISCLAIMER)).toBe(1);
    expect(markdown).not.toContain(MEDICAL_OUTPUT_DISCLAIMER);
    expect(html).not.toContain(MEDICAL_OUTPUT_DISCLAIMER);
  });

  it("escapes stored text in HTML and returns deterministic export metadata", () => {
    const source = report("doctor-visit");
    const html = exportReportHtml(source, true);
    const markdown = exportReportMarkdown(source);
    expect(html.content).toContain("Example &lt;Report&gt;");
    expect(html.content).toContain("Item &lt;one&gt;");
    expect(html.content).toContain("@page");
    expect(html.fileName).toBe("example-report.html");
    expect(markdown.fileName).toBe("example-report.md");
  });
});
