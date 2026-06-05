# Database Architecture

EndoGuide does not use Prisma, PostgreSQL, SQL migrations, or a Docker Compose database. The data architecture is Firestore plus local-only browser storage behind repository interfaces.

## Primary Data Stores

- Firebase mode: Firestore for structured records and Firebase Storage for document bytes.
- Emulator mode: Firebase Emulator Suite with the same repository interfaces.
- Local-only mode: IndexedDB for structured records and document metadata, with localStorage limited to simple non-sensitive settings.

## Collections and Stores

The planned collection/store names are:

- `users`
- `patientProfiles`
- `symptomEntries`
- `treatmentEntries`
- `medicationLogs`
- `appointments`
- `medicalDocuments`
- `documentTags`
- `doctorReports`
- `timelineEvents`
- `researchNotes`
- `researchSources`
- `biologicalEntities`
- `entityRelationships`
- `guidelineSnippets`
- `aiInteractionLogs`
- `userSettings`
- `auditLogs`

## Schemas

TypeScript domain types live in:

```text
src/lib/domain
```

Zod schemas live in:

```text
src/lib/validation
```

Every user-owned document includes `userId`, `createdAt`, and `updatedAt`. Domain objects also allow future `encryptedFields` metadata so sensitive-field encryption can be introduced without reshaping every collection.

## Access Pattern

Feature code should call repository interfaces from `src/lib/storage`. It should not import Firestore, Firebase Storage, IndexedDB, or localStorage directly.
