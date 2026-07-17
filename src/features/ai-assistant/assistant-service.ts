"use client";

import { aiClientResultSchema, aiChatRequestSchema } from "@/lib/ai/schemas";
import type { AIClientResult } from "@/lib/ai/types";
import type { StorageProvider } from "@/lib/storage";

export type AssistantServiceOptions = {
  localInteractionLogging: boolean;
  fetchImpl?: typeof fetch;
};

export async function sendAssistantMessage(
  storage: StorageProvider,
  userId: string,
  message: string,
  options: AssistantServiceOptions
): Promise<AIClientResult> {
  const request = aiChatRequestSchema.parse({ feature: "assistant", message });
  const response = await (options.fetchImpl ?? fetch)("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error("The assistant request could not be completed.");
  }

  const result = aiClientResultSchema.parse(await response.json());
  await persistAIInteractionMetadata(storage, userId, result, options.localInteractionLogging);
  return result;
}

export async function persistAIInteractionMetadata(
  storage: StorageProvider,
  userId: string,
  result: AIClientResult,
  localInteractionLogging: boolean
) {
  if (storage.mode === "local" && !localInteractionLogging) return null;

  return storage.aiInteractionLogs.create({
    userId,
    requestId: result.metadata.requestId,
    feature: result.metadata.feature,
    ...(result.metadata.provider ? { provider: result.metadata.provider } : {}),
    ...(result.metadata.model ? { model: result.metadata.model } : {}),
    safetyClassification: result.metadata.safetyClassification,
    blocked: result.metadata.blocked,
    disclaimerIncluded: result.metadata.disclaimerIncluded,
    ...(result.metadata.tokenUsage ? { tokenUsage: result.metadata.tokenUsage } : {}),
    promptStored: false,
    responseStored: false
  });
}
