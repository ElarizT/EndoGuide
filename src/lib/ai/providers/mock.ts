import type { AIProvider, AIProviderRegistration, AIProviderRequest, AIProviderResult } from "../types";

export class MockAIProvider implements AIProvider {
  readonly name = "mock" as const;
  readonly model: string;
  readonly calls: AIProviderRequest[] = [];
  private readonly result: AIProviderResult;

  constructor(result: Partial<AIProviderResult> = {}) {
    this.model = result.model ?? "mock-safe-model";
    this.result = {
      text: result.text ?? "Here is a neutral organizational summary of the information provided.",
      model: this.model,
      tokenUsage: result.tokenUsage ?? { input: 10, output: 12, total: 22 }
    };
  }

  isAvailable() {
    return true;
  }

  async generate(request: AIProviderRequest): Promise<AIProviderResult> {
    this.calls.push(request);
    return this.result;
  }
}
export const mockProviderRegistration: AIProviderRegistration = {
  id: "mock",
  create() {
    return new MockAIProvider();
  }
};
