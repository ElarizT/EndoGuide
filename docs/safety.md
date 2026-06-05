# Safety Architecture

## Core Boundary

EndoGuide supports research intelligence and patient organization. It must not provide clinical decision making.

Allowed:

- Organizing symptoms, documents, appointments, questions, and timelines.
- Summarizing user-provided medical records in neutral language.
- Summarizing scientific literature and guidelines for educational purposes.
- Helping prepare questions for healthcare professionals.
- Explaining medical terminology at a general educational level.
- Highlighting uncertainty, limitations, and topics to discuss with a clinician.

Not allowed:

- Diagnosing diseases.
- Prescribing, recommending, starting, stopping, or changing medication.
- Suggesting medication dosages.
- Recommending surgery or recommending avoiding surgery.
- Ranking treatment options.
- Generating personalized treatment plans.
- Claiming certainty regarding a user's medical condition.
- Presenting the system as a healthcare professional.

## Mandatory Treatment Recommendation Response

When users ask for treatment recommendations, the response must be exactly:

```text
I can help organize information, summarize evidence, and prepare questions for discussion with a qualified healthcare professional, but I cannot provide medical advice or treatment recommendations.
```

No additional explanation should be appended to this exact response in that path.

## Mandatory AI Medical Disclaimer

Every AI-generated medical output must include:

```text
This information is for educational and organizational purposes only and should not be used as medical advice.
```

This requirement applies to summaries, research explanations, document summaries, appointment preparation, timeline interpretations, and symptom pattern summaries.

## Safety Components

```text
src/lib/safety/
  policy.ts              Allowed and disallowed categories
  classifier.ts          Intent and risk classification
  response-templates.ts  Exact refusal and disclaimer text
  output-guards.ts       Post-generation validation
```

## Safety Pipeline

1. Normalize the user request.
2. Classify intent as organizational, educational, research, appointment-prep, or disallowed clinical advice.
3. If treatment recommendation intent is detected, return the exact mandatory response.
4. If allowed, construct a bounded prompt with explicit role and safety constraints.
5. Route to the AI provider.
6. Post-check output for prohibited language or missing disclaimer.
7. Log the interaction metadata in `aiInteractionLogs`.
8. Return the response with the mandatory disclaimer when applicable.

## Prompting Principles

AI prompts should:

- State that EndoGuide is not a clinician.
- Restrict output to educational, organizational, and question-preparation support.
- Instruct the model not to diagnose, recommend treatment, or make medical decisions.
- Ask the model to preserve uncertainty.
- Prefer "questions to ask your clinician" over "actions to take."
- Include source boundaries when summarizing research.

## Output Guard Examples

Flag and block or rewrite outputs containing phrasing such as:

- "You should start..."
- "You should stop..."
- "The best treatment is..."
- "I recommend this medication..."
- "You likely have..."
- "Surgery is the right choice..."
- "Avoid surgery..."

Allowed safer alternatives:

- "You may want to discuss this topic with a qualified healthcare professional."
- "The evidence summary can help prepare questions for your appointment."
- "Some studies discuss this association, but it does not determine what is appropriate for an individual patient."

## Escalation Language

EndoGuide should encourage users to seek urgent medical care for emergency symptoms, while avoiding diagnosis. Emergency guidance should be generic and jurisdiction-neutral, for example: if symptoms feel severe, sudden, or life-threatening, contact local emergency services or seek urgent medical care.

## Testing Safety

Safety tests should include:

- Exact response snapshot for treatment recommendation requests.
- Mandatory disclaimer enforcement.
- Blocked diagnosis examples.
- Blocked medication dosage examples.
- Blocked surgery recommendation examples.
- Allowed research summary examples.
- Allowed appointment question preparation examples.
