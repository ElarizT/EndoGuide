# EndoGuide Architecture

## Purpose

EndoGuide is an AI-powered patient intelligence and research platform for endometriosis. The architecture must support patient-owned medical organization, research intelligence, appointment preparation, and strict clinical safety boundaries.

The system must not perform diagnosis, treatment recommendation, medication advice, surgical decision support, or personalized care planning.

## Architectural Goals

- Keep clinical safety rules centralized and enforceable across UI, services, and AI layers.
- Allow the app to run in Firebase mode or local-only mode without changing feature code.
- Keep all data access behind internal repository and service interfaces.
- Support local-first development with Firebase Emulator Suite.
- Use typed schemas and validation at all trust boundaries.
- Prepare for future research graph, document intelligence, and AI model routing features.

## Proposed Application Layers

```text
src/
  app/                         Next.js App Router routes and layouts
  components/                  Shared UI components
  features/                    Product feature modules
  lib/
    auth/                      Auth abstractions and providers
    storage/                   Repository interfaces and implementations
    ai/                        AI provider abstraction and routing
    safety/                    Medical safety policy and guardrails
    validation/                Zod schemas and shared validators
    config/                    Environment parsing and app runtime config
    audit/                     Audit event helpers
    utils/                     Shared utilities
  test/                        Test utilities and fixtures
```

## Implemented Foundation

The current foundation includes:

- Next.js App Router routes for the initial product areas.
- Shared layout and sidebar navigation.
- shadcn/ui-compatible setup with TailwindCSS.
- `src/lib/domain` TypeScript domain models.
- `src/lib/validation` Zod schemas.
- `src/lib/firebase` configuration, client, and emulator helpers.
- `src/lib/local` IndexedDB/localStorage primitives.
- `src/lib/storage` provider and repository abstractions.
- `src/lib/auth` provider abstraction for Firebase and local-only auth.
- `src/lib/safety` constants, disclaimers, and basic policy helpers.

## Suggested Folder Structure

```text
src/
  app/
    (app)/
      dashboard/
      timeline/
      symptoms/
      appointments/
      documents/
      research/
      settings/
    api/
      ai/
      documents/
    layout.tsx
    page.tsx
  components/
    ui/                        shadcn/ui components
    layout/
    safety/
    forms/
  features/
    patient-profile/
    symptom-tracking/
    treatment-journal/
    medication-logging/
    appointments/
    documents/
    doctor-reports/
    timeline/
    research-notes/
    research-graph/
    ai-assistant/
    settings/
  lib/
    auth/
      types.ts
      provider.ts
      firebase/
      local/
    storage/
      types.ts
      provider.ts
      repositories.ts
      firebase/
      local/
    ai/
      types.ts
      provider.ts
      router.ts
      openai-compatible.ts
      prompts/
    safety/
      policy.ts
      classifier.ts
      response-templates.ts
      output-guards.ts
    validation/
      schemas/
      shared.ts
    config/
      env.ts
      runtime.ts
    audit/
      audit-log.ts
```

## Frontend Boundaries

The frontend should own:

- Route composition, layouts, navigation, responsive UI, and interaction state.
- Form rendering and client-side validation with Zod.
- Local optimistic state where appropriate.
- Calling feature services, never Firebase APIs directly.
- Displaying safety disclaimers and blocked-response templates consistently.

The frontend should not own:

- Direct Firestore queries.
- Direct Firebase Storage upload logic outside storage provider implementations.
- AI prompt construction for medical content outside the AI/safety service layer.
- Medical safety classification logic embedded ad hoc in components.

## Backend and Service Boundaries

For the MVP, Next.js server routes and server actions can provide backend boundaries where needed. They should own:

- AI provider calls.
- Server-side safety checks and output validation.
- Secure document processing workflows.
- Audit logging for sensitive actions.
- Integration points that require secrets.

Client-only local mode should use equivalent internal service interfaces with local implementations.

## Feature Module Pattern

Each feature should be organized around UI, schema, repository use, and service behavior:

```text
features/symptom-tracking/
  components/
  schemas.ts
  service.ts
  hooks.ts
  types.ts
```

Feature services should depend on repository interfaces imported from `src/lib/storage`, not on Firebase or IndexedDB directly.

## Runtime Modes

EndoGuide should support:

- `firebase`: authenticated cloud-backed mode using Firebase Auth, Firestore, and Firebase Storage.
- `local`: local-only mode using IndexedDB/localStorage and no cloud sync.
- `emulator`: development mode using Firebase Emulator Suite.

Runtime mode should be selected from environment configuration and exposed through a typed app config object.

Current runtime mode selection uses `NEXT_PUBLIC_ENDOGUIDE_STORAGE_MODE` with supported values `local`, `firebase`, and `emulator`. If Firebase mode is requested but required Firebase config is missing, the storage provider falls back to local mode during development.

## Data Flow

```text
UI component
  -> feature service/hook
  -> repository interface
  -> storage provider implementation
  -> Firebase, emulator, or local database
```

AI data flow:

```text
UI request
  -> feature AI service
  -> safety pre-check
  -> AI router
  -> provider adapter
  -> safety post-check
  -> audit log
  -> UI response with disclaimer
```

## Extension Points

- Research graph: biological entities, entity relationships, guideline snippets, and research sources.
- Document intelligence: OCR, document tagging, appointment packet generation, and report drafting.
- Multi-provider AI: OpenAI-compatible providers, local models, task-specific routing, and fallback policies.
- Export and portability: patient-controlled exports, local backups, and clinician-ready summaries.
- Consent and sharing: scoped share links, time-limited access, and explicit revocation.
