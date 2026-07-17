# Firebase Architecture

## Firebase Services

Planned Firebase services:

- Firebase Authentication for user identity.
- Firestore for structured application data.
- Firebase Storage for medical documents and generated file artifacts.
- Firebase Security Rules for authorization.
- Firebase Emulator Suite for local development.

Implemented Firebase files:

```text
src/lib/firebase/
  client.ts
  config.ts
  emulator.ts
  types.ts
firebase.json
firestore.rules
storage.rules
firestore.indexes.json
```

## Runtime Modes

- `firebase`: production or hosted development Firebase project.
- `emulator`: local Firebase Emulator Suite.
- `local`: no Firebase dependency for user data.

Environment configuration should determine the active mode.

## Firestore Collection Schemas

All collections should include:

- `id`
- `userId`
- `createdAt`
- `updatedAt`
- optional `deletedAt` for soft-delete where useful
- optional `schemaVersion`

### users

Stores non-sensitive account metadata.

Fields:

- `displayName`
- `email`
- `createdAt`
- `updatedAt`
- `lastLoginAt`

### patientProfiles

Stores patient-owned profile context for organization, not diagnosis.

Fields:

- `userId`
- `preferredName`
- `birthYear`
- `countryOrRegion`
- `knownConditionsText`
- `careTeamNotes`
- `emergencyContactOptional`

### symptomEntries

Stores symptom tracking records.

Fields:

- `userId`
- `occurredAt`
- `symptomTypes`
- `severity`
- `bodyLocations`
- `freeTextNotes`
- `cycleContext`
- `tags`

### treatmentEntries

Stores user-recorded treatment history without recommendations.

Fields:

- `userId`
- `name`
- `category`
- `startDate`
- `endDate`
- `notes`
- `prescribingClinicianOptional`

### medicationLogs

Stores user-entered medication history or logs without advice.

Fields:

- `userId`
- `medicationName`
- `recordedAt`
- `doseText`
- `frequencyText`
- `reasonText`
- `notes`

### appointments

Stores appointment preparation and visit notes.

Fields:

- `userId`
- `scheduledAt`
- `clinicianName`
- `clinicName`
- `reason`
- `questions`
- `notes`
- `followUps`

### medicalDocuments

Stores document metadata. File bytes live in Firebase Storage.

Fields:

- `userId`
- `fileName`
- `contentType`
- `storagePath`
- `uploadedAt`
- `documentDate`
- `sourceType`
- `tags`
- `extractedTextStatus`

### documentTags

Stores user-controlled document tag taxonomy.

Fields:

- `userId`
- `name`
- `color`
- `description`

### doctorReports

Stores generated organizational reports for clinician discussion.

Fields:

- `userId`
- `title`
- `generatedAt`
- `dateRange`
- `sections`
- `sourceRecordIds`
- `disclaimerIncluded`

### timelineEvents

Stores unified health timeline events.

Fields:

- `userId`
- `occurredAt`
- `eventType`
- `title`
- `description`
- `sourceCollection`
- `sourceId`

### researchNotes

Stores user notes on studies, guidelines, and concepts.

Fields:

- `userId`
- `title`
- `body`
- `sourceIds`
- `entityIds`
- `tags`

### researchSources

Stores research source metadata.

Fields:

- `userId`
- `title`
- `authors`
- `journalOrPublisher`
- `publishedAt`
- `url`
- `doi`
- `abstract`
- `sourceType`

### biologicalEntities

Stores research graph entities, usually global or curated.

Fields:

- `name`
- `entityType`
- `aliases`
- `description`
- `sourceIds`

### entityRelationships

Stores relationships between biological or research entities.

Fields:

- `sourceEntityId`
- `targetEntityId`
- `relationshipType`
- `evidenceSummary`
- `sourceIds`
- `confidenceLabel`

### guidelineSnippets

Stores educational excerpts or paraphrased guideline references.

Fields:

- `title`
- `organization`
- `publishedAt`
- `url`
- `topic`
- `snippet`
- `sourceCitation`

### aiInteractionLogs

Stores AI interaction metadata and safety status.

Fields:

- `userId`
- `feature`
- `provider`
- `model`
- `createdAt`
- `safetyClassification`
- `blocked`
- `disclaimerIncluded`
- `tokenUsage`
- `promptStored`
- `responseStored`

### userSettings

Stores user preferences.

Fields:

- `userId`
- `theme`
- `locale`
- `storageModePreference`
- `aiConsentSettings`
- `notificationPreferences`

### auditLogs

Stores sensitive operation metadata.

Fields:

- `userId`
- `eventType`
- `createdAt`
- `actorId`
- `targetCollection`
- `targetId`
- `metadata`

## Firestore Rules Principles

- Deny by default.
- Authenticated users can only access records where `request.auth.uid == resource.data.userId`.
- Creates must require `request.auth.uid == request.resource.data.userId`.
- Global research collections should be read-only to normal users unless user-specific copies are created.
- Audit logs should be append-only for clients or written only through trusted server paths.

The rules deny by default, explicitly allow only known user-owned collections, keep global research collections read-only to authenticated users, and make audit logs append-only from the client. The generic user-owned match is intentionally allowlisted so it cannot override curated or append-only collection rules.

## Storage Paths

Firebase Storage paths should be user-scoped:

```text
users/{userId}/documents/{documentId}/{fileName}
users/{userId}/generated-reports/{reportId}/{fileName}
```

Rules should ensure authenticated users can only read and write within their own user path.

Current Storage rules also enforce the same 10 MB limit and PDF, PNG, JPEG, or plain-text content types used by client validation.

## Emulator Suite

Local Firebase development should use:

- Auth emulator.
- Firestore emulator.
- Storage emulator.
- Seed scripts for non-sensitive sample data.
- Rules tests for ownership and denial behavior.

The checked-in emulator setup uses the isolated project ID `demo-endoguide`. Emulator mode can use safe demo client configuration when production Firebase values are absent. Java 11 or newer is required by the Firebase emulators.
