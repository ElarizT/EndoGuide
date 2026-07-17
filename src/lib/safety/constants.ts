export const TREATMENT_RECOMMENDATION_REFUSAL =
  "I can help organize information, summarize evidence, and prepare questions for discussion with a qualified healthcare professional, but I cannot provide medical advice or treatment recommendations.";

export const MEDICAL_OUTPUT_DISCLAIMER =
  "This information is for educational and organizational purposes only and should not be used as medical advice.";

export const RESEARCH_OUTPUT_DISCLAIMER =
  "Research information is not medical advice.";

export const DISALLOWED_MEDICAL_ACTIONS = [
  "diagnose",
  "prescribe",
  "recommend medication",
  "suggest dosage",
  "recommend surgery",
  "recommend avoiding surgery",
  "rank treatment options",
  "generate a personalized treatment plan",
  "claim certainty regarding medical conditions"
] as const;
