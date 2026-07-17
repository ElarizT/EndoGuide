import type { GeneratedReport, ReportSourceData } from "../report-types";
import { cleanStoredText, joinRecorded, uniqueIds } from "./shared";

export function generateResearchSummary(data: ReportSourceData): GeneratedReport {
  const notes = (data.researchNotes ?? []).slice().sort((a, b) => a.title.localeCompare(b.title) || a.createdAt.localeCompare(b.createdAt));

  return {
    reportType: "research-summary",
    title: "Research Summary",
    disclaimerIncluded: true,
    generatorVersion: "phase-4-v1",
    sourceRecordIds: uniqueIds(notes.map(({ id }) => id)),
    sections: notes.length
      ? notes.map((note) => ({
          heading: cleanStoredText(note.title, "Untitled research note"),
          body: cleanStoredText(note.body, "No note body recorded."),
          items: [
            `Tags: ${joinRecorded(note.tags)}`,
            `Stored source references: ${note.sourceIds?.length ?? 0}`
          ]
        }))
      : [{
          heading: "Stored Research Notes",
          body: "No stored research notes were available for this report."
        }]
  };
}
