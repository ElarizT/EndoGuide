# AI Architecture

## Status

Implemented for Phase 5. Phase 6 has not started.

The AI Assistant is an educational and organizational interface. It does not automatically read stored health records, generate reports, diagnose, or recommend care. Only the message explicitly submitted in the chat is sent to the configured provider.

## Request Flow

```text
Assistant UI
  -> POST /api/ai/chat (Zod validation, 4,000-character limit)
  -> input safety classification
      -> blocked: exact refusal, no provider call
      -> allowed: provider router
  -> provider registry/composition boundary
  -> selected provider adapter
  -> output safety classification
      -> unsafe: discard output and return exact refusal
      -> allowed: normalize required disclaimer exactly once
  -> metadata-only safety event
  -> UI response
  -> optional interaction metadata persistence through StorageProvider
```

Provider calls and prompt construction run in the Next.js server route. `GEMINI_API_KEY` has no `NEXT_PUBLIC_` prefix and is never returned to or bundled into the browser.

## Package Layout

```text
src/lib/ai/
  client.ts               Safety-wrapped orchestration
  config.ts               Provider-neutral client limits and safe defaults
  router.ts               Provider-neutral feature routing
  schemas.ts              Zod request, response, and metadata validation
  safety-middleware.ts    Pre-check, post-check, metadata-only decision logging
  types.ts                Provider and client contracts
  providers/
    registry.ts           Provider registration and environment composition
    gemini.ts             Gemini config and generateContent REST adapter
    mock.ts               Deterministic test provider
    unavailable.ts        No-key/disabled behavior
  prompts/                 Active and reserved prompt definitions
```

## Provider Contract

Providers implement a small internal interface with:

- Provider name and model identifier.
- Availability check.
- Provider-neutral `systemPrompt`, `user`/`assistant` messages, and maximum output tokens.
- Text result and optional token usage.

Feature and UI code depend on this interface and router, not on a Gemini SDK or vendor response type. Provider identifiers are open strings rather than a closed vendor-name union, so a future adapter can register its own identifier without changing the shared contracts.

`providers/registry.ts` is the composition boundary. It selects a registered adapter from environment configuration and injects the resulting `AIProvider` into the provider-neutral router. The core client, router, safety middleware, API route, and UI contain no Gemini request types, endpoints, or response handling.

The Gemini adapter owns Gemini-specific environment parsing (`GEMINI_API_KEY`, model, and base URL), follows Google's `models.generateContent` REST endpoint, converts internal `systemPrompt` to `systemInstruction`, converts internal `assistant` messages to Gemini's `model` role, sends the API key in the `x-goog-api-key` server header, requests `store: false`, and validates response candidates and token metadata before use. See the official [Gemini generateContent reference](https://ai.google.dev/api/generate-content) and [Gemini 2.5 Flash model page](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash).

## Environment Configuration

| Variable | Purpose | Default |
| --- | --- | --- |
| `ENDOGUIDE_AI_PROVIDER` | Registered provider identifier (currently `gemini`, `mock`, or `disabled`) | `gemini` when a key exists; otherwise `disabled` |
| `GEMINI_API_KEY` | Server-only provider credential | none |
| `GEMINI_MODEL` | Gemini model ID | `gemini-2.5-flash` |
| `GEMINI_API_BASE_URL` | Gemini-compatible base URL | Google Generative Language API |
| `ENDOGUIDE_AI_MAX_OUTPUT_TOKENS` | Bounded output limit | `1024` |
| `NEXT_PUBLIC_ENDOGUIDE_LOCAL_AI_LOGGING` | Initial local metadata logging choice | `false` |

Invalid provider, URL, model, or token-limit configuration falls back to safe defaults. Without an API key, routing uses the unavailable provider and performs no network request.

## Persistence Boundary

The server returns non-sensitive interaction metadata with the safety-checked answer. The client feature service optionally writes that metadata through `StorageProvider.aiInteractionLogs`.

Stored fields are limited to:

- Random request ID.
- Feature, provider, and model.
- Safety classification and blocked status.
- Disclaimer status.
- Token counts when supplied by the provider.
- `promptStored: false` and `responseStored: false`.

Firebase and emulator modes persist metadata through the existing user-owned repository. Local-only mode disables metadata persistence by default and exposes an explicit in-session opt-in checkbox.

## Deferred Work

- Authentication and abuse-rate controls for the AI API route before public deployment.
- Explicit context selection/redaction for attaching stored records.
- Streaming responses and cancellation.
- Provider retries, timeouts, and multi-provider failover.
- Research Copilot, evidence extraction, red-flag analysis, and Knowledge Graph functionality.


