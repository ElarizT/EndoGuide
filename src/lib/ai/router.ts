import { createConfiguredAIProvider, type AIProviderRegistryOptions } from "./providers/registry";
import type { AIFeature, AIProvider } from "./types";

export class AIProviderRouter {
  private readonly provider: AIProvider;

  constructor(provider: AIProvider) {
    this.provider = provider;
  }

  route(_feature: AIFeature): AIProvider {
    return this.provider;
  }
}

export function createAIProviderRouter(
  options: AIProviderRegistryOptions = {}
) {
  return new AIProviderRouter(createConfiguredAIProvider(options));
}
