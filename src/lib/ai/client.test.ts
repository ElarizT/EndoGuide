import { describe, expect, it, vi } from "vitest";
import { MEDICAL_OUTPUT_DISCLAIMER, TREATMENT_RECOMMENDATION_REFUSAL } from "@/lib/safety";
import { SafeAIClient } from "./client";
import { MockAIProvider, UnavailableAIProvider } from "./providers";
import { AIProviderRouter } from "./router";
import type { AISafetyDecisionEvent, AISafetyDecisionLogger } from "./types";


function clientWith(provider: MockAIProvider, logger: AISafetyDecisionLogger = vi.fn()) {
  return {
    client: new SafeAIClient({
      router: new AIProviderRouter(provider),
      logger,
      maxOutputTokens: 512
    }),
    logger
  };
}

const blockedPrompts = [
  "Should I get surgery?",
  "What medication should I take?",
  "Can I stop my hormones?",
  "Give me a personalized treatment plan.",
  "Do I definitely have endometriosis?"
];

const allowedPrompts = [
  "Summarize my symptom history.",
  "Help me prepare questions for my doctor.",
  "Explain what this research note means in simple language.",
  "Create a timeline summary from my entries."
];

describe("safe AI client", () => {
  it.each(blockedPrompts)("blocks before the provider call: %s", async (message) => {
    const provider = new MockAIProvider();
    const { client, logger } = clientWith(provider);
    const result = await client.send({ feature: "assistant", message });

    expect(result.status).toBe("blocked");
    expect(result.message).toBe(TREATMENT_RECOMMENDATION_REFUSAL);
    expect(result.message).not.toMatch(/\byou should (?:take|get|start|stop)\b/i);
    expect(result.metadata.blocked).toBe(true);
    expect(result.metadata.disclaimerIncluded).toBe(false);
    expect(provider.calls).toHaveLength(0);
    expect(logger).toHaveBeenCalledWith(expect.objectContaining({ stage: "input", blocked: true }));
  });

  it.each(allowedPrompts)("permits an organizational request with one disclaimer: %s", async (message) => {
    const provider = new MockAIProvider({ text: "A neutral organizational answer." });
    const { client } = clientWith(provider);
    const result = await client.send({ feature: "assistant", message });

    expect(result.status).toBe("allowed");
    expect(result.metadata.safetyClassification).toBe("allowed");
    expect(result.metadata.disclaimerIncluded).toBe(true);
    expect(result.message.split(MEDICAL_OUTPUT_DISCLAIMER)).toHaveLength(2);
    expect(provider.calls).toHaveLength(1);
  });

  it("discards unsafe provider output before it can reach the caller", async () => {
    const unsafe = "You should start this medication and stop your current hormones.";
    const provider = new MockAIProvider({ text: unsafe });
    const { client } = clientWith(provider);
    const result = await client.send({ message: "Organize my notes." });

    expect(result.status).toBe("blocked");
    expect(result.message).toBe(TREATMENT_RECOMMENDATION_REFUSAL);
    expect(result.message).not.toContain(unsafe);
    expect(result.metadata.safetyClassification).toBe("blocked-unsafe-output");
  });

  it("blocks imperative medication output even without an explicit recommendation phrase", async () => {
    const provider = new MockAIProvider({ text: "Take ibuprofen for your pain." });
    const { client } = clientWith(provider);
    const result = await client.send({ message: "Organize my symptom notes." });
    expect(result.status).toBe("blocked");
    expect(result.message).toBe(TREATMENT_RECOMMENDATION_REFUSAL);
    expect(result.message).not.toContain("ibuprofen");
  });

  it("deduplicates disclaimers returned by a provider", async () => {
    const provider = new MockAIProvider({
      text: `Neutral summary. ${MEDICAL_OUTPUT_DISCLAIMER} ${MEDICAL_OUTPUT_DISCLAIMER}`
    });
    const { client } = clientWith(provider);
    const result = await client.send({ message: "Summarize my symptom history." });
    expect(result.message.split(MEDICAL_OUTPUT_DISCLAIMER).length - 1).toBe(1);
  });

  it("logs metadata-only safety decisions", async () => {
    const events: AISafetyDecisionEvent[] = [];
    const provider = new MockAIProvider();
    const { client } = clientWith(provider, (event) => { events.push(event); });
    await client.send({ message: "Explain my timeline." });

    expect(events).toHaveLength(2);
    expect(events.map((event) => event.stage)).toEqual(["input", "output"]);
    expect(JSON.stringify(events)).not.toContain("Explain my timeline");
  });

  it("returns a graceful unavailable response when no provider is configured", async () => {
    const router = new AIProviderRouter(new UnavailableAIProvider());

    const client = new SafeAIClient({ router, logger: vi.fn() });
    const result = await client.send({ message: "Summarize my symptom history." });

    expect(result.status).toBe("unavailable");
    expect(result.message).toContain("not configured");
    expect(result.metadata.provider).toBe("disabled");
  });
});

