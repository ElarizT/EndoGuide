# Storage Architecture

## Goal

All product features must depend on internal repository and service interfaces, not directly on Firebase, IndexedDB, localStorage, or any vendor SDK. This allows EndoGuide to switch between Firebase mode and local-only mode while preserving feature code.

## Storage Modes

- Firebase mode: Firebase Authentication, Firestore, and Firebase Storage.
- Emulator mode: Firebase Emulator Suite for local development.
- Local-only mode: IndexedDB for structured data and localStorage for lightweight settings or flags.

## Proposed Package Structure

```text
src/lib/storage/
  types.ts
  provider.ts
  repositories.ts
  firebase/
    client.ts
    firestore.ts
    storage.ts
    repositories/
  local/
    indexed-db.ts
    local-storage.ts
    repositories/
```

## Implemented Package Structure

The foundation now includes:

```text
src/lib/storage/
  types.ts
  provider.ts
  repositories/
  firebase/
    generic-repository.ts
    index.ts
  local/
    generic-repository.ts
    index.ts
```

Feature code should import `createStorageProvider` or repository types from `src/lib/storage`, never Firebase SDK modules directly.

## Repository Interfaces

Initial repository boundaries:

- `PatientProfileRepository`
- `SymptomEntryRepository`
- `TreatmentEntryRepository`
- `MedicationLogRepository`
- `AppointmentRepository`
- `MedicalDocumentRepository`
- `DocumentTagRepository`
- `DoctorReportRepository`
- `TimelineEventRepository`
- `ResearchNoteRepository`
- `ResearchSourceRepository`
- `ResearchGraphRepository`
- `GuidelineSnippetRepository`
- `AIInteractionLogRepository`
- `UserSettingsRepository`
- `AuditLogRepository`

The first implementation uses generic CRUD-style repository interfaces:

- `create`
- `getById`
- `listByUser`
- `update`
- `delete`

User-owned `getById`, `update`, and `delete` calls require an explicit `userId`. Both local and Firebase adapters enforce that ownership boundary so feature code cannot rely only on route IDs or vendor rules.

Curated/global research repositories currently expose read-only methods.

## Phase 2 Feature Usage

The patient dashboard, symptom tracker, and treatment history features use the storage provider abstraction:

- Dashboard reads symptoms, treatments, appointments, documents, reports, and research notes.
- Symptom tracker reads and writes through `symptomEntries`.
- Treatment history reads and writes through `treatmentEntries`.
- Symptom and treatment creation create simple timeline events through `timelineEvents`.

UI components must continue to avoid direct Firebase, IndexedDB, or localStorage imports.

## Phase 3 Feature Usage

The medical document vault, appointments, appointment preparation, and unified timeline continue to use the same repository boundary:

- Documents write metadata through `medicalDocuments`.
- Appointments write appointment records through `appointments`.
- Timeline events are written through `timelineEvents`.
- Appointment preparation reads existing repositories and generates deterministic Markdown/HTML output without AI calls.

File bytes use a separate file storage abstraction in `src/lib/files`:

- Firebase mode uploads bytes to Firebase Storage.
- Local-only mode stores browser-local blobs through IndexedDB when available.

Feature components should call feature services rather than importing Firebase SDKs or local database APIs directly.

## Phase 4 Report Usage

The reports feature continues to use the existing `doctorReports` repository in every runtime mode. The stored `DoctorReport` document now identifies one of five report types and keeps typed sections, source record IDs, disclaimer metadata, and a generator version.

Report creation follows this boundary:

1. The client report service obtains the current user and `StorageProvider` through the existing client service boundary.
2. The service reads only the repositories permitted for the selected report type.
3. A pure deterministic generator produces report sections from existing records.
4. Zod validates the report document in the local or Firebase repository adapter before persistence.
5. Detail, Markdown, HTML, and print renderers use the persisted report snapshot.

Research Summary has a deliberately narrower data boundary: it reads `researchNotes` only. It does not read `researchSources`, medical records, curated/global research stores, or external services.

The UI does not access Firebase or IndexedDB directly. Firebase ownership rules already include `doctorReports`, and local-only reports remain in the existing `doctorReports` IndexedDB object store. No SQL or Prisma storage path is introduced.

## Provider Interface Shape

The storage provider should expose repositories as a single dependency root:

```ts
export interface StorageProvider {
  mode: "firebase" | "emulator" | "local";
  patientProfiles: PatientProfileRepository;
  symptomEntries: SymptomEntryRepository;
  treatmentEntries: TreatmentEntryRepository;
  medicationLogs: MedicationLogRepository;
  appointments: AppointmentRepository;
  medicalDocuments: MedicalDocumentRepository;
  documentTags: DocumentTagRepository;
  doctorReports: DoctorReportRepository;
  timelineEvents: TimelineEventRepository;
  researchNotes: ResearchNoteRepository;
  researchSources: ResearchSourceRepository;
  researchGraph: ResearchGraphRepository;
  guidelineSnippets: GuidelineSnippetRepository;
  aiInteractionLogs: AIInteractionLogRepository;
  userSettings: UserSettingsRepository;
  auditLogs: AuditLogRepository;
}
```

## Common Repository Conventions

Repository methods should:

- Accept an explicit `userId` or local user context.
- Return typed domain objects.
- Validate input with Zod before persistence.
- Normalize timestamps.
- Avoid exposing Firebase document references or IndexedDB internals.
- Use consistent pagination and ordering types.

Example method families:

- `create`
- `getById`
- `listByUser`
- `update`
- `delete`
- `search` where needed

## Local Storage Responsibilities

IndexedDB should store structured records:

- Patient profiles.
- Symptom entries.
- Treatment entries.
- Medication logs.
- Appointments.
- Document metadata.
- Doctor reports.
- Timeline events.
- Research notes and sources.
- AI interaction metadata.
- Audit events.

localStorage should be limited to:

- Runtime mode preference.
- Non-sensitive UI preferences.
- Feature flags for local development.

Avoid storing sensitive health records in localStorage.

## File Storage Abstraction

Medical document storage uses a file storage abstraction:

- Firebase mode: Firebase Storage.
- Local mode: IndexedDB Blob storage where browser support and quota allow it.

Document metadata should be stored separately from file bytes.

Local-only file persistence must always be described honestly in the UI. Browser-local files are not synced, are tied to a browser profile, and can be removed when browser site data is cleared.

## Migration Strategy

Future migration needs:

- Local-only export to encrypted archive.
- Local-only import.
- Firebase-to-local export.
- Local-to-Firebase sync after authentication.
- Schema versioning for local IndexedDB stores.

No SQL migrations, Prisma, PostgreSQL, or Docker Compose database should be introduced.
