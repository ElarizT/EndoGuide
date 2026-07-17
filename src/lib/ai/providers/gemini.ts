import { z } from "zod";
import type {
  AIProvider,
  AIProviderRegistration,
  AIProviderRequest,
  AIProviderResult
} from "../types";

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const DEFAULT_GEMINI_BASE_URL = "https://generativelanguage.googleapis.com";

const geminiConfigSchema = z.object({
  apiKey: z.string().trim().min(1).optional(),
  model: z.string().trim().min(1).max(120).default(DEFAULT_GEMINI_MODEL),
  baseUrl: z.string().url().default(DEFAULT_GEMINI_BASE_URL)
});

export type GeminiProviderConfig = z.infer<typeof geminiConfigSchema>;

export function getGeminiProviderConfig(
  env: Record<string, string | undefined> = process.env
): GeminiProviderConfig {
  const parsed = geminiConfigSchema.safeParse({
    apiKey: env.GEMINI_API_KEY?.trim() || undefined,
    model: env.GEMINI_MODEL?.trim() || undefined,
    baseUrl: env.GEMINI_API_BASE_URL?.trim() || undefined
  });
  if (parsed.success) {
    return { ...parsed.data, baseUrl: parsed.data.baseUrl.replace(/\/$/, "") };
  }
  return {
    apiKey: env.GEMINI_API_KEY?.trim() || undefined,
    model: DEFAULT_GEMINI_MODEL,
    baseUrl: DEFAULT_GEMINI_BASE_URL
  };
}

const geminiResponseSchema = z.object({
  candidates: z.array(z.object({
    content: z.object({
      parts: z.array(z.object({ text: z.string().optional() }).passthrough()).default([])
    }).optional(),
    finishReason: z.string().optional()
  }).passthrough()).default([]),
  promptFeedback: z.object({ blockReason: z.string().optional() }).passthrough().optional(),
  usageMetadata: z.object({
    promptTokenCount: z.number().int().nonnegative().optional(),
    candidatesTokenCount: z.number().int().nonnegative().optional(),
    totalTokenCount: z.number().int().nonnegative().optional()
  }).passthrough().optional(),
  modelVersion: z.string().optional()
}).passthrough();

export class GeminiProvider implements AIProvider {
  readonly name = "gemini" as const;
  readonly model: string;
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config: GeminiProviderConfig, fetchImpl: typeof fetch = fetch) {
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.baseUrl = config.baseUrl;
    this.fetchImpl = fetchImpl;
  }

  isAvailable() {
    return Boolean(this.apiKey);
  }

  async generate(request: AIProviderRequest): Promise<AIProviderResult> {
    if (!this.apiKey) {
      throw new Error("Gemini provider is not configured.");
    }

    const response = await this.fetchImpl(
      `${this.baseUrl}/v1beta/models/${encodeURIComponent(this.model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": this.apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: request.systemPrompt }]
          },
          contents: request.messages.map((message) => ({
            role: message.role === "assistant" ? "model" : "user",
            parts: [{ text: message.content }]
          })),
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: request.maxOutputTokens
          },
          store: false
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini request failed with status ${response.status}.`);
    }

    const parsed = geminiResponseSchema.parse(await response.json());
    if (parsed.promptFeedback?.blockReason) {
      throw new Error("Gemini blocked the request.");
    }
    const text = parsed.candidates
      .flatMap((candidate) => candidate.content?.parts ?? [])
      .map((part) => part.text ?? "")
      .join("")
      .trim();

    if (!text) throw new Error("Gemini returned no text.");

    return {
      text,
      model: parsed.modelVersion || this.model,
      tokenUsage: parsed.usageMetadata ? {
        input: parsed.usageMetadata.promptTokenCount,
        output: parsed.usageMetadata.candidatesTokenCount,
        total: parsed.usageMetadata.totalTokenCount
      } : undefined
    };
  }
}
export const geminiProviderRegistration: AIProviderRegistration = {
  id: "gemini",
  autoSelect(env) {
    return Boolean(env.GEMINI_API_KEY?.trim());
  },
  create({ env, fetchImpl }) {
    return new GeminiProvider(getGeminiProviderConfig(env), fetchImpl);
  }
};

export const GEMINI_PROVIDER_DEFAULTS = {
  model: DEFAULT_GEMINI_MODEL,
  baseUrl: DEFAULT_GEMINI_BASE_URL
} as const;
