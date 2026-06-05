# Daily Symptom Tracker

## Status

Implemented as a Phase 2 feature.

## Fields

The tracker captures:

- Date.
- Pain score from 0 to 10.
- Pain locations: pelvic, abdomen, lower back, legs, bowel, bladder, other.
- Bleeding severity.
- Period status.
- Cycle day.
- Fatigue.
- Nausea.
- Mood.
- Sleep quality.
- Bowel symptoms.
- Bladder symptoms.
- Pain during sex.
- Pain after sex.
- Work impact.
- School impact.
- Exercise impact.
- Triggers.
- Relief methods.
- Freeform notes.

## Behavior

Implemented behavior:

- Create symptom entry form.
- Zod validation.
- Repository-backed persistence in Firebase or local-only mode.
- Symptom history list.
- Symptom detail route.
- Edit and delete flows.
- Basic pain trend and heatmap charts.
- Empty, loading, and error states.
- Timeline helper event creation on symptom entry creation.

## Storage

The feature uses:

```text
storage.symptomEntries
storage.timelineEvents
```

Feature UI does not import Firebase SDKs, Firestore APIs, IndexedDB APIs, or localStorage directly.

## Safety

The tracker is for user-entered observation and appointment preparation. It must not diagnose or interpret symptoms as a medical condition.
