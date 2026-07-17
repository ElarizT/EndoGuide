import type { AIProvider, AIProviderRegistration, AIProviderRequest, AIProviderResult } from "../types";

export class UnavailableAIProvider implements AIProvider {
  readonly name = "disabled" as const;
  readonly model = "not-configured";

  isAvailable() {
    return false;
  }

  async generate(_request: AIProviderRequest): Promise<AIProviderResult> {
    throw new Error("AI provider is not configured.");
  }
}
export const unavailableProviderRegistration: AIProviderRegistration = {
  id: "disabled",
  create() {
    return new UnavailableAIProvider();
  }
};
