# Local-Only Mode

## Purpose

Local-only mode lets users use EndoGuide without cloud persistence. It is also essential for local-first development, privacy-sensitive testing, and offline-capable future workflows.

## Principles

- No Firebase Authentication required.
- No Firestore or Firebase Storage writes.
- No user health data leaves the browser unless the user explicitly invokes a networked AI feature and consents.
- Sensitive structured data should be stored in IndexedDB, not localStorage.
- The UI should clearly identify local-only mode and explain data persistence limits.

## Local Identity

Local mode should create a local pseudonymous user context:

```ts
type LocalUser = {
  id: string;
  mode: "local";
  createdAt: string;
};
```

This ID is only for local record ownership and should not imply account identity.

## Storage Design

Use IndexedDB stores mirroring repository boundaries:

- `patientProfiles`
- `symptomEntries`
- `treatmentEntries`
- `medicationLogs`
- `appointments`
- `medicalDocuments`
- `documentBlobs`
- `documentTags`
- `doctorReports`
- `timelineEvents`
- `researchNotes`
- `researchSources`
- `aiInteractionLogs`
- `userSettings`
- `auditLogs`

localStorage may store:

- Active runtime mode.
- Local user ID pointer.
- Non-sensitive UI preferences.

Implemented local files:

```text
src/lib/local/
  local-db.ts
  local-storage.ts
  types.ts
```

`local-db.ts` initializes IndexedDB object stores for the planned repository boundaries and includes a memory fallback for non-browser tests.

## Document Handling

Local document metadata belongs in IndexedDB. Phase 3 stores file bytes as IndexedDB Blobs when available and stores the local blob reference in document metadata.

The UI must show this limitation:

> Local-only files are stored in this browser's local storage/IndexedDB when available. They are not synced, are tied to this browser profile, and may be removed if browser site data is cleared.

Future options include:

- File System Access API for user-selected folders.
- Encrypted local archive export.
- Browser-native backup package.

## AI in Local Mode

Local-only data storage does not automatically mean local-only AI processing. The app must distinguish:

- Local storage mode.
- AI provider mode.
- User consent to send selected content to an AI provider.

Before sending sensitive local data to a remote AI provider, the UI should require explicit user action and clear context selection.

## Sync and Portability

Future local-to-cloud sync should:

- Ask for explicit user consent.
- Show what data will be uploaded.
- Preserve local IDs through migration mapping.
- Avoid duplicate records.
- Support export before sync.

## Risks

- Browser data can be cleared by the user or browser.
- Local device compromise can expose stored data.
- Cross-browser access is not available without export/import.
- Large document storage may hit browser quota limits.

These risks should be explained plainly in the product UI before local-only mode is used for important records.
