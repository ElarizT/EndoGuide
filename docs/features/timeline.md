# Unified Timeline

## Status

Implemented for Phase 3.

## Timeline Event Schema

Timeline events are stored through the `timelineEvents` repository and support Firebase and local-only modes.

Core fields:

- `occurredAt`
- `eventType`
- `title`
- `description`
- `sourceCollection`
- `sourceId`

Event types:

- Symptom
- Treatment
- Medication
- Appointment
- Procedure
- Test
- Report
- Document
- Flare-up
- Note
- Other

## Automatic Event Creation

Automatic timeline event creation exists for:

- Symptom entries
- Treatment entries
- Appointments
- Medical documents

Document events are mapped deterministically:

- Blood Test, Ultrasound, and MRI become `test`
- Surgery Report becomes `procedure`
- Clinic Letter and Referral become `report`
- Other document types become `document`

## User Interface

The timeline page includes:

- Chronological event list
- Filters by event type
- Empty states
- Event detail card

## Safety

Timeline entries organize user-entered records only. They do not diagnose, recommend treatment, recommend medication, or recommend surgery.
