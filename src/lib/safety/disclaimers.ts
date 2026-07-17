import { MEDICAL_OUTPUT_DISCLAIMER, TREATMENT_RECOMMENDATION_REFUSAL } from "./constants";

export function appendMedicalDisclaimer(output: string) {
  const withoutDuplicates = output
    .split(MEDICAL_OUTPUT_DISCLAIMER)
    .join("")
    .trim();
  return `${withoutDuplicates}\n\n${MEDICAL_OUTPUT_DISCLAIMER}`;
}

export function getTreatmentRecommendationRefusal() {
  return TREATMENT_RECOMMENDATION_REFUSAL;
}
