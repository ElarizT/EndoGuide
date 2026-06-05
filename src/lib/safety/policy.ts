import { TREATMENT_RECOMMENDATION_REFUSAL } from "./constants";

const treatmentAdvicePatterns = [
  /\bwhat (treatment|medication|dose|dosage) should i\b/i,
  /\bshould i (start|stop|take|avoid|choose)\b/i,
  /\brecommend (a )?(treatment|medication|dose|dosage|surgery)\b/i,
  /\bwhich treatment is best\b/i,
  /\bdo i need surgery\b/i
];

export type SafetyClassification =
  | "allowed"
  | "blocked-treatment-advice"
  | "needs-review";

export function classifyUserMedicalRequest(input: string): SafetyClassification {
  if (treatmentAdvicePatterns.some((pattern) => pattern.test(input))) {
    return "blocked-treatment-advice";
  }
  return "allowed";
}

export function getSafetyResponseForRequest(input: string): string | null {
  const classification = classifyUserMedicalRequest(input);
  if (classification === "blocked-treatment-advice") {
    return TREATMENT_RECOMMENDATION_REFUSAL;
  }
  return null;
}
