import { describe, expect, it } from "vitest";
import { AI_CONFIG_DEFAULTS, getAIClientConfig } from "./config";

describe("provider-neutral AI client configuration", () => {
  it("uses a provider-neutral output limit default", () => {
    expect(getAIClientConfig({})).toEqual({
      maxOutputTokens: AI_CONFIG_DEFAULTS.maxOutputTokens
    });
  });

  it("accepts a bounded output limit", () => {
    expect(getAIClientConfig({ ENDOGUIDE_AI_MAX_OUTPUT_TOKENS: "2048" }).maxOutputTokens).toBe(2048);
  });

  it("falls back safely for an invalid output limit", () => {
    expect(
      getAIClientConfig({ ENDOGUIDE_AI_MAX_OUTPUT_TOKENS: "999999" }).maxOutputTokens
    ).toBe(AI_CONFIG_DEFAULTS.maxOutputTokens);
  });
});
