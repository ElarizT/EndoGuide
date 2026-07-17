import type { AIFeature, AISafetyDecisionEvent, AISafetyDecisionLogger } from "./types";
import { classifyAIOutput, classifyUserMedicalRequest } from "@/lib/safety";

export function checkAIInput(input: string) {
  const classification = classifyUserMedicalRequest(input);
  return {
    classification,
    blocked: classification !== "allowed"
  } as const;
}

export function checkAIOutput(output: string) {
  const classification = classifyAIOutput(output);
  return {
    classification,
    blocked: classification !== "allowed"
  } as const;
}

export function createSafetyDecisionEvent(
  event: Omit<AISafetyDecisionEvent, "feature"> & { feature?: AIFeature }
): AISafetyDecisionEvent {
  return {
    ...event,
    feature: event.feature ?? "assistant"
  };
}

export const metadataOnlySafetyLogger: AISafetyDecisionLogger = (event) => {
  console.info("[ai-safety]", JSON.stringify(event));
};

export async function logSafetyDecision(
  logger: AISafetyDecisionLogger,
  event: AISafetyDecisionEvent
) {
  try {
    await logger(event);
  } catch {
    // Safety logging must never expose an unsafe model response or prevent a refusal.
  }
}
