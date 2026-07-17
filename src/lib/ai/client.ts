import { getAIClientConfig } from "./config";
import { ASSISTANT_SAFETY_PROMPT } from "./prompts";
import { createAIProviderRouter, type AIProviderRouter } from "./router";
import { aiChatRequestSchema } from "./schemas";
import {
  checkAIInput,
  checkAIOutput,
  createSafetyDecisionEvent,
  logSafetyDecision,
  metadataOnlySafetyLogger
} from "./safety-middleware";
import type {
  AIClientResult,
  AIInteractionMetadata,
  AISafetyDecisionLogger
} from "./types";
import {
  appendMedicalDisclaimer,
  MEDICAL_OUTPUT_DISCLAIMER,
  TREATMENT_RECOMMENDATION_REFUSAL
} from "@/lib/safety";

const PROVIDER_UNAVAILABLE_MESSAGE =
  "The AI assistant is not configured. Add server-side provider credentials to enable model responses.";
const PROVIDER_ERROR_MESSAGE =
  "The AI assistant could not complete this request. Please try again later.";

export type AIClientOptions = {
  router?: AIProviderRouter;
  logger?: AISafetyDecisionLogger;
  maxOutputTokens?: number;
};

function baseMetadata(requestId: string): AIInteractionMetadata {
  return {
    requestId,
    feature: "assistant",
    safetyClassification: "allowed",
    blocked: false,
    disclaimerIncluded: false,
    promptStored: false,
    responseStored: false
  };
}

export class SafeAIClient {
  private readonly router: AIProviderRouter;
  private readonly logger: AISafetyDecisionLogger;
  private readonly maxOutputTokens: number;

  constructor(options: AIClientOptions = {}) {
    const config = getAIClientConfig();
    this.router = options.router ?? createAIProviderRouter();
    this.logger = options.logger ?? metadataOnlySafetyLogger;
    this.maxOutputTokens = options.maxOutputTokens ?? config.maxOutputTokens;
  }

  async send(input: unknown): Promise<AIClientResult> {
    const request = aiChatRequestSchema.parse(input);
    const requestId = crypto.randomUUID();
    const inputDecision = checkAIInput(request.message);

    await logSafetyDecision(this.logger, createSafetyDecisionEvent({
      requestId,
      stage: "input",
      classification: inputDecision.classification,
      blocked: inputDecision.blocked
    }));

    if (inputDecision.blocked) {
      return {
        status: "blocked",
        message: TREATMENT_RECOMMENDATION_REFUSAL,
        metadata: {
          ...baseMetadata(requestId),
          safetyClassification: inputDecision.classification,
          blocked: true
        }
      };
    }

    const provider = this.router.route(request.feature);
    if (!provider.isAvailable()) {
      await logSafetyDecision(this.logger, createSafetyDecisionEvent({
        requestId,
        stage: "routing",
        classification: "allowed",
        blocked: false,
        provider: provider.name,
        model: provider.model
      }));
      return {
        status: "unavailable",
        message: PROVIDER_UNAVAILABLE_MESSAGE,
        metadata: {
          ...baseMetadata(requestId),
          provider: provider.name,
          model: provider.model
        }
      };
    }

    try {
      const generated = await provider.generate({
        systemPrompt: ASSISTANT_SAFETY_PROMPT,
        messages: [{ role: "user", content: request.message }],
        maxOutputTokens: this.maxOutputTokens
      });
      const outputDecision = checkAIOutput(generated.text);

      await logSafetyDecision(this.logger, createSafetyDecisionEvent({
        requestId,
        stage: "output",
        classification: outputDecision.classification,
        blocked: outputDecision.blocked,
        provider: provider.name,
        model: generated.model
      }));

      if (outputDecision.blocked) {
        return {
          status: "blocked",
          message: TREATMENT_RECOMMENDATION_REFUSAL,
          metadata: {
            ...baseMetadata(requestId),
            provider: provider.name,
            model: generated.model,
            safetyClassification: outputDecision.classification,
            blocked: true,
            tokenUsage: generated.tokenUsage
          }
        };
      }

      const safeMessage = appendMedicalDisclaimer(generated.text);
      return {
        status: "allowed",
        message: safeMessage,
        metadata: {
          ...baseMetadata(requestId),
          provider: provider.name,
          model: generated.model,
          disclaimerIncluded: safeMessage.split(MEDICAL_OUTPUT_DISCLAIMER).length - 1 === 1,
          tokenUsage: generated.tokenUsage
        }
      };
    } catch {
      await logSafetyDecision(this.logger, createSafetyDecisionEvent({
        requestId,
        stage: "output",
        classification: "needs-review",
        blocked: true,
        provider: provider.name,
        model: provider.model
      }));
      return {
        status: "error",
        message: PROVIDER_ERROR_MESSAGE,
        metadata: {
          ...baseMetadata(requestId),
          provider: provider.name,
          model: provider.model,
          safetyClassification: "needs-review",
          blocked: true
        }
      };
    }
  }
}

export function createAIClient(options: AIClientOptions = {}) {
  return new SafeAIClient(options);
}

export const AI_CLIENT_MESSAGES = {
  unavailable: PROVIDER_UNAVAILABLE_MESSAGE,
  error: PROVIDER_ERROR_MESSAGE
} as const;
