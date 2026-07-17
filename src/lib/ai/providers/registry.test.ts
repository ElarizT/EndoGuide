import { describe, expect, it } from "vitest";
import { createConfiguredAIProvider } from "./registry";

describe("AI provider registry", () => {
  it("falls back to the unavailable provider without configured credentials", () => {
    expect(createConfiguredAIProvider({ env: {} }).name).toBe("disabled");
  });

  it("auto-selects Gemini only at the composition boundary", () => {
    const provider = createConfiguredAIProvider({
      env: { GEMINI_API_KEY: "server-secret" }
    });

    expect(provider.name).toBe("gemini");
    expect(provider.isAvailable()).toBe(true);
  });

  it("supports an explicitly selected mock provider", () => {
    const provider = createConfiguredAIProvider({
      env: { ENDOGUIDE_AI_PROVIDER: "mock" }
    });

    expect(provider.name).toBe("mock");
  });
});
