# Treatment History

## Status

Implemented as a Phase 2 feature.

## Fields

Treatment history captures:

- Treatment name.
- Treatment type.
- Start date.
- End date.
- Outcome.
- Side effects.
- Reason stopped.
- Doctor.
- Clinic.
- Notes.

Treatment types:

- Medication.
- Hormonal therapy.
- Surgery.
- Physiotherapy.
- Pelvic floor therapy.
- Lifestyle.
- Nutrition.
- Other.

## Behavior

Implemented behavior:

- Create treatment form.
- Zod validation.
- Repository-backed persistence in Firebase or local-only mode.
- Active treatment list.
- Past treatment list.
- Treatment detail route.
- Edit and delete flows.
- Timeline helper event creation on treatment entry creation.

## Storage

The feature uses:

```text
storage.treatmentEntries
storage.timelineEvents
```

Feature UI does not import Firebase SDKs, Firestore APIs, IndexedDB APIs, or localStorage directly.

## Safety

Treatment history organizes user-entered information only. It must never evaluate whether a treatment was correct and must never recommend continuing, stopping, starting, or changing a treatment.
