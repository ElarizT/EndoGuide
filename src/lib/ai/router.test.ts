import { describe, expect, it } from "vitest";
import { MEDICAL_OUTPUT_DISCLAIMER } from "@/lib/safety";
import { SafeAIClient } from "./client";
import { createConfiguredAIProvider } from "./providers/registry";
import { AIProviderRouter } from "./router";
import type { AIProvider, AIProviderRegistration } from "./types";

describe("provider-neutral routing contract", () => {
  it("registers and routes an arbitrary future provider identifier", async () => {
    const futureProvider: AIProvider = {
      name: "future-provider.example",
      model: "future-model",
      isAvailable: () => true,
      async generate(request) {
        expect(request.systemPrompt).toContain("EndoGuide");
        expect(request.messages).toEqual([
          { role: "user", content: "Explain my timeline." }
        ]);
        return {
          text: "Neutral future-provider response.",
          model: "future-model"
        };
      }
    };
    const registration: AIProviderRegistration = {
      id: "future-provider.example",
      create: () => futureProvider
    };
    const provider = createConfiguredAIProvider({
      env: { ENDOGUIDE_AI_PROVIDER: "future-provider.example" },
      registrations: [registration]
    });
    const router = new AIProviderRouter(provider);

    expect(router.route("assistant")).toBe(futureProvider);

    const result = await new SafeAIClient({
      router,
      logger: () => undefined,
      maxOutputTokens: 512
    }).send({ message: "Explain my timeline." });

    expect(result.status).toBe("allowed");
    expect(result.metadata.provider).toBe("future-provider.example");
    expect(result.message).toContain(MEDICAL_OUTPUT_DISCLAIMER);
  });
});
