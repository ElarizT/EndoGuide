# EndoGuide

EndoGuide is a production-quality MVP for an AI-powered endometriosis patient intelligence platform. It helps people with suspected or confirmed endometriosis organize medical information, understand symptom patterns, prepare for appointments, explore scientific research, and communicate more effectively with healthcare professionals.

EndoGuide is not a doctor, diagnosis engine, treatment recommender, medication advisor, or surgical decision-maker. The product exists to help patients become better informed and better prepared while keeping clinical decision-making with qualified healthcare professionals.

## Product Principles

- Support patient organization, research literacy, appointment preparation, and longitudinal self-observation.
- Maintain a strict boundary between research intelligence and clinical decision making.
- Use AI only for education, summarization, organization, question preparation, and evidence navigation.
- Never diagnose, prescribe, rank treatments, recommend surgery, recommend avoiding surgery, or generate personalized treatment plans.
- Include clear educational-only disclaimers on every AI-generated medical output.
- Design for privacy, local-first development, and future production hardening.

## Stack

- Frontend: Next.js 15+, TypeScript, App Router, TailwindCSS, shadcn/ui.
- Data and storage: Firebase Authentication, Firestore, Firebase Storage, Firebase Security Rules, Firebase Emulator Suite, local-only mode using IndexedDB/localStorage, storage provider abstraction.
- Validation: Zod.
- AI layer: server-side provider abstraction, Gemini-compatible adapter, provider routing, mock provider, and two-gate medical safety middleware.
- Testing: Vitest, Playwright, and Firebase Rules Unit Testing.
- Documentation: architecture, safety, privacy/security, storage, Firebase, local-only mode, implementation plan, and roadmap docs.

## Safety Boundary

When users ask for treatment recommendations, EndoGuide must respond exactly:

> I can help organize information, summarize evidence, and prepare questions for discussion with a qualified healthcare professional, but I cannot provide medical advice or treatment recommendations.

Every AI-generated medical output must include:

> This information is for educational and organizational purposes only and should not be used as medical advice.

## Documentation

- [Architecture](docs/architecture.md)
- [Safety](docs/safety.md)
- [Privacy and Security](docs/privacy-security.md)
- [Storage Architecture](docs/storage-architecture.md)
- [Firebase Architecture](docs/firebase-architecture.md)
- [Local-Only Mode](docs/local-only-mode.md)
- [Implementation Plan](docs/implementation-plan.md)
- [Feature Roadmap](docs/feature-roadmap.md)
- [Reports](docs/features/reports.md)
- [AI Architecture](docs/ai-architecture.md)
- [AI Safety](docs/ai-safety.md)
- [Prompt System](docs/prompt-system.md)

## Repository Status

This repository contains the foundation and the feature slices completed through the current phase:

- Next.js App Router scaffold with placeholder product routes.
- TailwindCSS and shadcn/ui-compatible configuration.
- Firebase configuration, emulator configuration, Firestore rules, and Storage rules.
- Local-only IndexedDB/localStorage primitives.
- Storage and authentication provider abstractions.
- Domain TypeScript types and Zod schemas for planned collections.
- Safety constants and policy helpers.
- Vitest foundation tests.
- Patient dashboard with repository-backed summaries and reusable charts.
- Daily symptom tracker with create, history, detail, edit, delete, validation, and timeline helper events.
- Treatment history with active/past organization, detail, edit, delete, validation, and timeline helper events.
- Phase 3 medical document, appointment preparation, and unified timeline features.
- Phase 4 deterministic Patient Summary, Doctor Visit, Research Summary, Symptom Trend, and Quality of Life reports.
- Repository-backed report dashboard, creation flow, detail pages, Markdown/HTML exports, and a printable browser layout.
- Phase 5 safety-bounded AI Assistant with server-side Gemini-compatible routing, graceful no-key behavior, safe suggestions, in-memory chat history, and metadata-only repository logging.

Research Copilot, Science Skills, OCR, and Knowledge Graph functionality remain out of scope. Phase 6 has not been started.

## Local Development

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Use `NEXT_PUBLIC_ENDOGUIDE_STORAGE_MODE=local` to run without Firebase.
4. Run `npm run dev`.

Firebase emulator mode can be enabled with:

```text
NEXT_PUBLIC_ENDOGUIDE_STORAGE_MODE=emulator
```

Emulator mode uses isolated `demo-endoguide` client defaults when production Firebase values are absent. Install Java 11 or newer, then run `npm run firebase:emulators` in a separate terminal. No real Firebase project is required.

To enable the AI Assistant, set server-only environment values in `.env.local`:

```text
ENDOGUIDE_AI_PROVIDER=gemini
GEMINI_API_KEY=your-server-side-key
GEMINI_MODEL=gemini-2.5-flash
```

Do not prefix the Gemini key with `NEXT_PUBLIC_`. Without a key, the app continues to run and the assistant reports that no provider is configured.

## Tests

Run:

```text
npm test
npm run typecheck
npm run build
```

For browser smoke tests, install Chromium once with `npx playwright install chromium`, then run `npm run test:e2e`.

For Firestore and Storage ownership tests, install Java 11 or newer and run `npm run test:rules`.
