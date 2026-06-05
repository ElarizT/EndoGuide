# Privacy and Security

## Privacy Principles

EndoGuide will handle highly sensitive health information. The product should be designed around data minimization, user control, local-first development, and explicit boundaries for cloud storage and AI processing.

Core principles:

- Collect only data needed for user-facing organization and intelligence features.
- Make local-only mode a first-class option.
- Keep storage provider implementations isolated behind internal interfaces.
- Avoid sending user health data to AI providers unless a user explicitly invokes an AI feature.
- Log AI interactions carefully without storing unnecessary raw sensitive content.
- Provide future export and delete mechanisms.
- Treat all medical documents, symptom entries, notes, and generated reports as sensitive.

## Security Principles

- All user data must be scoped by authenticated user ID in Firebase mode.
- Firebase Security Rules must deny by default.
- Firestore writes must validate ownership and expected document structure where feasible.
- Firebase Storage paths must be user-scoped.
- Server-side routes must validate inputs with Zod.
- Environment variables must be parsed through typed configuration.
- Secrets must never be exposed to the browser.
- Audit logs should record sensitive operations without leaking document contents.

## Data Classification

Highly sensitive:

- Patient profiles.
- Symptom entries.
- Treatment entries.
- Medication logs.
- Appointment notes.
- Medical documents.
- Doctor reports.
- Timeline events.
- AI prompts and generated medical outputs.

Moderately sensitive:

- Research notes.
- Research sources saved by a user.
- User settings.
- Document tags.

Operational:

- Audit logs.
- AI interaction metadata.
- Runtime settings.

## Authentication and Authorization

Firebase mode:

- Use Firebase Authentication for identity.
- Use user-scoped Firestore paths or explicit `userId` fields with strict rules.
- Prevent users from reading or writing other users' data.
- Keep admin-only operations out of client code.

Local-only mode:

- Do not require authentication.
- Store data only in the browser profile unless future encrypted backup/export is introduced.
- Clearly indicate that local data can be lost if browser storage is cleared.

## AI Privacy

AI requests should:

- Send the minimum context required.
- Redact unnecessary identifiers where possible.
- Avoid including raw full documents when a short extracted passage or selected summary is enough.
- Store provider, model, feature name, safety classification, timestamps, and token metadata when available.
- Avoid storing full prompts and responses by default unless the user opts in or debugging mode is enabled locally.

## Audit Logging

Audit logs should capture:

- Document upload, delete, tag, and report-generation events.
- AI interaction creation and safety-block events.
- Export and delete events.
- Authentication-sensitive events where available.

Audit logs should avoid:

- Full medical document content.
- Raw AI prompts containing sensitive health data.
- Medication dosages or detailed clinical notes unless strictly necessary.

## Future Security Enhancements

- Client-side encryption for selected local and cloud records.
- User-controlled export packages.
- Account deletion and data purge workflow.
- Consent-based sharing with clinicians.
- Time-limited share links.
- Field-level redaction before AI calls.
- Security headers and Content Security Policy.
- Dependency scanning and CI security checks.
