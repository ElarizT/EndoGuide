# Appointment Preparation

## Status

Implemented for Phase 3.

## Generation Model

Appointment preparation is deterministic and template-based. No AI assistant, research copilot, DeepMind Science Skills, or knowledge graph behavior is used.

Inputs come from repository-backed user data:

- Symptoms
- Treatments
- Appointments
- Documents
- Timeline events

## Sections

Generated outputs include:

- Appointment Summary
- Top Symptoms
- Most Severe Symptoms
- Treatment History Summary
- Quality of Life Impact
- Questions To Ask
- Referral Discussion Topics
- Document Checklist
- Timeline Summary
- Patient Narrative

## Output Formats

Implemented:

- Printable HTML view
- HTML string
- Markdown export

PDF export is a TODO placeholder. It should be added only when PDF generation infrastructure is cleanly available.

## Required Disclaimer

Every generated output includes:

> This information is for educational and organizational purposes only and should not be used as medical advice.

## Safety Boundary

Generated content is limited to organization and question preparation. It must not diagnose, recommend treatment, recommend medication, recommend dosage, recommend surgery, or rank treatment options.
