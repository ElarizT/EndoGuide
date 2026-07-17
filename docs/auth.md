# Authentication Architecture

## Goal

EndoGuide must not be hard-coded permanently to Firebase Authentication. App features should depend on an internal auth provider interface so local-only mode and future auth providers remain possible.

## Implemented Structure

```text
src/lib/auth/
  types.ts
  provider.ts
  current-user.ts
  firebase/
  local/
```

## Provider Interface

The auth provider exposes:

- `getCurrentUser`
- `signOut`
- `onAuthStateChanged`
- optional `signInDemo` for local-only development

## Firebase Auth

Firebase mode uses Firebase Authentication through `src/lib/auth/firebase`. Firebase services are created by `src/lib/firebase/client.ts`, which reads environment variables and connects to emulators when configured. Emulator mode signs in an isolated anonymous demo user so current feature routes can exercise authenticated rules; production Firebase mode still requires a future sign-in UI.

## Local Auth

Local-only mode uses a pseudonymous local user stored through the local settings helper. This is not a real identity or account. It exists only to scope local records consistently.

## Future Extension Points

- Additional OAuth providers through Firebase Auth.
- Non-Firebase auth providers.
- Anonymous-to-authenticated migration.
- Account deletion and export workflows.
