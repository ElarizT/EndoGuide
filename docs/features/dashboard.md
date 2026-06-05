# Patient Dashboard

## Status

Implemented as a Phase 2 foundation feature.

## Purpose

The dashboard summarizes user-entered information without diagnosing, recommending treatments, or making clinical decisions.

## Implemented Widgets

- Today's pain score.
- Latest symptom entry.
- Recent flare-up count.
- Upcoming appointment count and card.
- Active treatment count.
- Uploaded document count.
- Generated report count.
- Research note count.
- Pain trend chart.
- Symptom heatmap.
- Cycle correlation chart.
- Treatment timeline chart.
- Quick check-in button.
- Disabled generate report button placeholder.

## Data Sources

The dashboard reads through the storage provider abstraction:

- `symptomEntries`
- `treatmentEntries`
- `appointments`
- `medicalDocuments`
- `doctorReports`
- `researchNotes`

No UI component calls Firebase directly.

## Demo Data

Fictional demo data is only used when:

```text
NEXT_PUBLIC_ENDOGUIDE_DEMO_MODE=true
```

and the user has no saved dashboard data. Otherwise the dashboard displays real repository data or empty states.

## Safety

Dashboard charts and summaries are descriptive only. They must not infer diagnoses, recommend treatments, rank treatments, or suggest medical actions.
