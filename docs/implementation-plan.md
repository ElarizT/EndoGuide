# Implementation Plan

## Phase 0: Documentation and Architecture

Status: complete. This file is the long-term roadmap, not a claim that every later phase is complete. The repository status and README describe the feature slices delivered through the current implementation phase.

Deliverables:

- README.
- Architecture documentation.
- Safety documentation.
- Privacy and security documentation.
- Storage architecture.
- Firebase architecture.
- Local-only mode documentation.
- Feature roadmap.

No feature implementation should be added in this phase.

## Phase 1: Project Foundation

Status: complete for the current implementation scope.

Deliverables:

- Create Next.js 15+ TypeScript project using App Router.
- Add TailwindCSS and shadcn/ui.
- Add Vitest and Playwright.
- Add typed environment configuration.
- Add base linting and formatting.
- Add documentation links in README.
- Establish `src/lib` and `src/features` structure.

Acceptance criteria:

- App runs locally.
- Unit test command runs.
- Playwright smoke test opens the app.
- No Firebase dependency leaks into feature components.

## Phase 2: Validation and Domain Types

Status: complete for the current implementation scope.

Deliverables:

- Add shared Zod schemas.
- Define domain models for planned collections.
- Add timestamp, ID, pagination, and user context primitives.
- Add validation tests.

Acceptance criteria:

- Core schemas validate create/update inputs.
- Domain types are exported from stable module boundaries.

## Phase 3: Storage Abstraction

Status: complete for the current implementation scope.

Deliverables:

- Implement `StorageProvider` interface.
- Define repository interfaces.
- Add local IndexedDB provider.
- Add lightweight localStorage settings provider.
- Add test fixtures and in-memory test doubles where helpful.

Acceptance criteria:

- Feature services can read/write through interfaces.
- Local-only mode can persist and reload sample records.
- Repository tests cover create/list/update/delete behavior.

## Phase 4: Firebase Foundation

Status: foundation implemented and hardened in the current review. Production authentication UI remains future work.

Deliverables:

- Configure Firebase client.
- Configure Auth, Firestore, Storage, and Emulator Suite.
- Implement Firebase repository providers.
- Draft Firebase Security Rules.
- Add rules tests.

Acceptance criteria:

- Emulator mode works locally.
- Authenticated user can access only own records.
- Cross-user access is denied in tests.

## Phase 5: Auth Abstraction

Status: provider abstraction implemented. Full production sign-in and route protection remain future work.

Deliverables:

- Define `AuthProvider` interface.
- Implement Firebase auth provider.
- Implement local auth provider.
- Add session state hooks and route protection boundaries.

Acceptance criteria:

- Runtime can switch between Firebase and local auth.
- UI can access current user context without vendor-specific APIs.

## Phase 6: Safety Layer

Status: constants and initial policy helpers implemented. AI-wide enforcement remains blocked on the future AI layer.

Deliverables:

- Implement safety policy constants.
- Implement treatment-recommendation exact response.
- Implement medical disclaimer enforcement.
- Add intent classification scaffold.
- Add output guard tests.

Acceptance criteria:

- Disallowed treatment requests return the exact required response.
- AI medical outputs include the mandatory disclaimer.
- Safety tests cover diagnosis, medication, surgery, and treatment-plan requests.

## Phase 7: AI Provider Abstraction

Status: not started.

Deliverables:

- Define OpenAI-compatible provider interface.
- Add model routing layer.
- Add AI request/response schemas.
- Add safety pre-check and post-check integration.
- Add AI interaction log repository integration.

Acceptance criteria:

- AI features depend on internal provider interfaces.
- Provider credentials stay server-side.
- Safety checks wrap every medical AI output.

## Phase 8: MVP Feature Slices

Status: partially implemented through dashboard, symptoms, treatment history, appointments, documents, deterministic appointment preparation, and timeline. Remaining items are future phases.

Recommended order:

1. Patient profile and settings.
2. Symptom entries.
3. Appointments and question preparation.
4. Medical document metadata and upload.
5. Timeline aggregation.
6. Research notes and sources.
7. Doctor report generation with safety disclaimers.

Acceptance criteria:

- Each feature uses repositories and validation.
- Each feature works in local mode first.
- Firebase mode follows after repository parity.

## Phase 9: Testing and Hardening

Deliverables:

- Unit tests for repositories, validation, safety, and AI routing.
- Playwright tests for core user flows.
- Firebase rules tests.
- Accessibility checks for key pages.
- Security review checklist.

Acceptance criteria:

- Core flows pass in local and emulator modes.
- Safety regression tests pass.
- Privacy-sensitive operations are audited.

## Phase 10: Production Readiness

Deliverables:

- Deployment environment documentation.
- Firebase production project setup checklist.
- Security headers.
- Error boundaries and observability.
- Data export/delete planning.
- Backup and retention policy planning.

Acceptance criteria:

- Production environment variables are documented.
- Firebase rules are tested before deployment.
- User-facing safety and privacy language is present.
