import { describe, expect, it, vi } from "vitest";
import { GeminiProvider } from "./gemini";

describe("Gemini-compatible provider", () => {
  it("translates provider-neutral requests to Gemini generateContent", async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: "Neutral response" }] } }],
        usageMetadata: {
          promptTokenCount: 5,
          candidatesTokenCount: 7,
          totalTokenCount: 12
        },
        modelVersion: "gemini-2.5-flash-001"
      })
    })) as unknown as typeof fetch;
    const provider = new GeminiProvider({
      apiKey: "secret-key",
      model: "gemini-2.5-flash",
      baseUrl: "https://generativelanguage.googleapis.com"
    }, fetchImpl);

    const result = await provider.generate({
      systemPrompt: "Safe system prompt",
      messages: [
        { role: "user", content: "Organize this note" },
        { role: "assistant", content: "Previous answer" }
      ],
      maxOutputTokens: 512
    });
    const [url, init] = vi.mocked(fetchImpl).mock.calls[0]!;
    const body = JSON.parse(String(init?.body));

    expect(String(url)).toContain("/v1beta/models/gemini-2.5-flash:generateContent");
    expect(String(url)).not.toContain("secret-key");
    expect((init?.headers as Record<string, string>)["x-goog-api-key"]).toBe("secret-key");
    expect(body.systemInstruction.parts[0].text).toBe("Safe system prompt");
    expect(body.contents.map((message: { role: string }) => message.role)).toEqual(["user", "model"]);
    expect(body.store).toBe(false);
    expect(result).toEqual({
      text: "Neutral response",
      model: "gemini-2.5-flash-001",
      tokenUsage: { input: 5, output: 7, total: 12 }
    });
  });

  it("is unavailable and does not call fetch without a key", async () => {
    const fetchImpl = vi.fn() as unknown as typeof fetch;
    const provider = new GeminiProvider({
      model: "gemini-2.5-flash",
      baseUrl: "https://generativelanguage.googleapis.com"
    }, fetchImpl);
    expect(provider.isAvailable()).toBe(false);
    await expect(provider.generate({
      systemPrompt: "safe",
      messages: [{ role: "user", content: "hello" }],
      maxOutputTokens: 512
    })).rejects.toThrow("not configured");
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
