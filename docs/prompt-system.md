# Prompt System

## Principles

Prompts are version-controlled TypeScript constants under `src/lib/ai/prompts`. They contain no credentials, user data, or environment-specific configuration. User input is passed as a separate provider message and never interpolated into the system instruction.

Code safety checks remain authoritative. Prompts reinforce safety but cannot override input classification, output guards, Zod validation, or metadata minimization.

## Prompt Files

| File | Phase 5 status |
| --- | --- |
| `assistant-safety.ts` | Active system instruction for the chat assistant |
| `doctor-report.ts` | Reserved; not connected to deterministic Phase 4 reports |
| `research-summary.ts` | Reserved; not connected to deterministic Research Summary reports |
| `research-copilot.ts` | Definition only; no Research Copilot functionality or routing |
| `evidence-extraction.ts` | Definition only; no extraction functionality |
| `knowledge-graph.ts` | Definition only; no graph functionality or persistence |
| `red-flags.ts` | Definition only; no triage or red-flag analysis functionality |

Only the assistant safety prompt is routed in Phase 5. Reserved prompts exist to establish reviewed boundaries for future work; their presence does not enable a feature.

## Active Assistant Prompt

The active prompt tells the provider to:

- Provide educational, organizational, summary, explanation, question-preparation, and checklist help.
- Avoid diagnosis and diagnostic certainty.
- Avoid treatment, medication, hormone, dosage, and surgery advice.
- Avoid treatment ranking and personalized plans.
- Preserve uncertainty and distinguish user-provided facts.
- Use the exact refusal for prohibited decision-making.
- End allowed medical output with the exact disclaimer once.

The client still normalizes the disclaimer and replaces unsafe output regardless of prompt compliance.

## Context and Privacy

Phase 5 sends only the message explicitly submitted in the assistant. It does not automatically retrieve symptoms, reports, documents, timeline entries, appointments, or research notes. Chat history is displayed in component state but not persisted or resent as provider context.

Future record-aware prompts must add explicit context selection, minimization, source labeling, and redaction before any stored health data is transmitted.

## Change Control

Prompt changes should include tests for exact safety strings, prohibited capabilities, source boundaries, and active versus reserved routing. Safety-sensitive prompt changes must be reviewed together with the code classifier and output guard.
