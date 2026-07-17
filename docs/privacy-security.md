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

Phase 5 AI requests:

- Are sent only after the user explicitly submits a chat message.
- Send only that message; stored health records and chat history are not automatically attached.
- Pass through server-side Zod validation and input safety checks before a provider call.
- Keep `GEMINI_API_KEY` server-only and outside all `NEXT_PUBLIC_` variables.
- Request provider-side non-storage with `store: false` where the Gemini-compatible endpoint supports it.
- Store only request ID, provider, model, feature, safety decision, disclaimer status, and token counts when available.
- Always set `promptStored` and `responseStored` to `false`; raw chat content is never written to the interaction repository.
- Disable interaction metadata persistence by default in local-only mode. Users may opt in for the current browser session.

Chat messages and responses exist only in in-memory React state and are cleared when the page reloads. The server safety logger records metadata-only decisions and never logs the submitted message or returned model text.

Future record-aware AI features must require explicit context selection and field-level minimization/redaction. Production exposure of the AI route also requires authentication-aware abuse prevention and rate controls.

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
