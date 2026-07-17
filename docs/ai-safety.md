# AI Safety

## Boundary

The Phase 5 assistant permits educational explanation, neutral organization, summaries of user-supplied text, timeline organization, appointment-question preparation, and non-medical checklists.

It blocks requests for:

- Diagnosis or diagnostic certainty.
- Medication selection or advice.
- Surgery advice or avoidance.
- Treatment recommendations or personalized treatment plans.
- Dosage advice.
- Treatment or medication ranking.
- Starting, stopping, discontinuing, or changing treatments, hormones, or medication.

## Exact Refusal

Every blocked input and every unsafe provider output returns exactly:

> I can help organize information, summarize evidence, and prepare questions for discussion with a qualified healthcare professional, but I cannot provide medical advice or treatment recommendations.

No disclaimer or extra explanation is appended to this refusal.

## Exact Disclaimer

Every allowed medical AI output includes exactly once:

> This information is for educational and organizational purposes only and should not be used as medical advice.

The output normalizer removes duplicate instances supplied by a provider and appends one canonical instance.

## Two-Gate Enforcement

### Input gate

The user message is normalized and classified before routing. A blocked request never reaches the provider. Classifications distinguish diagnosis, surgery, medication, dosage, ranking, start/stop, and general treatment advice for metadata and tests.

### Output gate

Provider text is held server-side until checked. The guard rejects diagnostic certainty, prescriptive medication/treatment language, dosage instructions, treatment ranking, and surgery recommendations. Rejected text is discarded and never included in the API response.

Provider errors and empty or invalid responses are also prevented from reaching the UI as model content.

## Defense in Depth

- The active system prompt repeats the safety boundary and exact strings.
- Safety logic remains code-enforced; prompt compliance is not trusted on its own.
- API requests and responses are validated with Zod.
- Raw provider errors are replaced with generic UI errors.
- Rendered assistant messages are React text, not untrusted HTML.
- Safety logs contain decision metadata only, never user text or model output.
- The mock provider makes safety behavior deterministic in tests.

## Test Cases

Required blocked and allowed phrases are covered as table-driven tests. Additional tests prove that blocked prompts cause no provider call, unsafe provider output is discarded, duplicate disclaimers are normalized, and decision logs do not contain the submitted message.

Pattern-based safety classification is intentionally conservative but cannot replace clinical review. Before a public production launch, add monitoring based on non-sensitive aggregates, adversarial testing, rate controls, and a reviewed policy update process.
