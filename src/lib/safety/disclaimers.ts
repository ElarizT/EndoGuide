import { MEDICAL_OUTPUT_DISCLAIMER, TREATMENT_RECOMMENDATION_REFUSAL } from "./constants";

export function appendMedicalDisclaimer(output: string) {
  if (output.includes(MEDICAL_OUTPUT_DISCLAIMER)) return output;
  return `${output.trim()}\n\n${MEDICAL_OUTPUT_DISCLAIMER}`;
}

export function getTreatmentRecommendationRefusal() {
  return TREATMENT_RECOMMENDATION_REFUSAL;
}
