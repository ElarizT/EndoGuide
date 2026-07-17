# Reports

## Status

Phase 4 is implemented.

EndoGuide generates and persists five deterministic report types from records the user has already stored. Report generation does not call an AI model, retrieve new research, diagnose, or recommend treatment, medication, dosage, or surgery.

## Report Types and Sources

| Report | Stored sources |
| --- | --- |
| Patient Summary | Patient profile, symptoms, treatment history, medication logs, appointments, and document metadata |
| Doctor Visit | Symptoms, treatment history, medication logs, appointments, and document metadata |
| Research Summary | Research notes only |
| Symptom Trend | Symptom entries only |
| Quality of Life | Quality-of-life fields already recorded on symptom entries only |

Optional date ranges filter dated records before generation. Patient profile data is not date-filtered. Research Summary filters stored research notes by their update timestamp and does not read research sources, external content, biological entities, guideline snippets, or medical records.

## Deterministic Generation

Each report type has a pure template generator in `src/features/reports/generators`. Generators sort records consistently and produce typed sections, source record IDs, and a generator version. They organize user-entered values and descriptive counts only.

Symptom Trend and Quality of Life reports do not infer trends, correlations, effectiveness, diagnoses, or causes. Where calculated, averages, minimums, and maximums are labeled as recorded values. User-entered notes and outcomes remain explicitly labeled as user-entered or recorded history.

## Safety Disclaimers

Patient Summary, Doctor Visit, Symptom Trend, and Quality of Life outputs include exactly:

> This information is for educational and organizational purposes only and should not be used as medical advice.

Research Summary outputs include exactly:

> Research information is not medical advice.

Export and detail renderers reserve these exact strings, remove duplicate occurrences from stored content, and append the applicable disclaimer once.

## Persistence and Privacy

Reports are stored through `StorageProvider.doctorReports`; UI components never import Firebase, Firestore, IndexedDB, or localStorage APIs.

- Firebase and emulator modes use the existing Firestore repository and ownership rules.
- Local-only mode uses the existing IndexedDB-backed repository.
- Zod validates report type, sections, timestamps, source IDs, disclaimer metadata, and generator version before persistence.
- Source record IDs are stored for traceability. Report content is a snapshot and is not silently regenerated when source records change.

## User Flow

The reports dashboard provides:

- Report type selection.
- Optional start and end dates.
- Deterministic creation and repository persistence.
- A list of saved reports.
- A report detail view.
- Markdown and standalone HTML downloads.
- A dedicated printable layout.
- Report deletion through the repository boundary.

## PDF

Direct binary PDF generation is deferred. Adding a PDF library would duplicate rendering and increase the client bundle without improving the current safety boundary. The print view includes a **Print or save as PDF** action, which uses the browser's native print-to-PDF support and the same printable layout and disclaimer renderer.

## Explicit Non-Goals

Phase 4 does not add an AI Assistant, Research Copilot, Science Skills, Knowledge Graph behavior, Prisma, PostgreSQL, direct Firebase UI access, diagnosis, clinical recommendations, or causal interpretation. Phase 5 has not been started.
