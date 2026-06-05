# Feature Roadmap

## MVP Foundations

- Runtime mode selector: Firebase, emulator, or local-only.
- Auth abstraction with Firebase and local providers.
- Storage abstraction with repository interfaces.
- Safety layer with prohibited clinical advice handling.
- AI provider abstraction with OpenAI-compatible interface.
- Core app shell using Next.js, TailwindCSS, and shadcn/ui.

## Patient Organization

- Patient profile.
- Symptom tracking.
- Treatment history journal.
- Medication logging as user-recorded history only.
- Appointment preparation.
- Medical document metadata and upload.
- Document tagging.
- Unified timeline.

## AI-Assisted Organization

- Symptom pattern summaries with disclaimers.
- Appointment question preparation.
- Medical document summarization.
- Doctor-facing report drafts.
- Research article summaries.
- User-controlled context selection before AI calls.

These features must stay educational and organizational. They must not diagnose or recommend treatment.

## Research Intelligence

- Research notes.
- Research source library.
- Biological entity extraction.
- Entity relationship graph.
- Guideline snippet library.
- Evidence map views.
- Research trend exploration.

Research intelligence should explain evidence and uncertainty without applying it as personalized medical advice.

## Privacy and Portability

- Local-only mode.
- Export package.
- Import package.
- Account deletion workflow.
- Cloud-to-local export.
- Optional local-to-cloud sync.
- Consent-based AI processing controls.

## Clinical Communication

- Appointment agenda builder.
- Clinician question list.
- Visit summary organizer.
- Longitudinal timeline report.
- Document packet builder.
- Shared read-only report links as a future feature.

## Future Integrations

- OCR and document parsing.
- Citation metadata lookup.
- Research database integrations.
- Calendar export.
- Wearable or cycle tracking import with explicit consent.
- Patient-controlled clinician sharing.

## Explicit Non-Goals

EndoGuide should not add:

- Diagnosis generation.
- Personalized treatment recommendation.
- Medication recommendation or dose advice.
- Surgical recommendation.
- Treatment ranking.
- Clinical decision support for individual care.
- Automated triage beyond generic emergency guidance.
