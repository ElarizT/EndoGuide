import { describe, expect, it, vi } from "vitest";
import type { AIClientResult } from "@/lib/ai/types";
import type { StorageProvider } from "@/lib/storage";
import { persistAIInteractionMetadata } from "./assistant-service";

const result: AIClientResult = {
  status: "allowed",
  message: "Safe answer",
  metadata: {
    requestId: "5cc9e718-06df-4b20-9e57-06107e86458f",
    feature: "assistant",
    provider: "mock",
    model: "mock-safe-model",
    safetyClassification: "allowed",
    blocked: false,
    disclaimerIncluded: true,
    tokenUsage: { input: 3, output: 4, total: 7 },
    promptStored: false,
    responseStored: false
  }
};

function storage(mode: StorageProvider["mode"], create = vi.fn(async (input) => input)) {
  return {
    mode,
    aiInteractionLogs: { create }
  } as unknown as StorageProvider;
}

describe("assistant interaction metadata persistence", () => {
  it("does not log in local-only mode unless the user enables it", async () => {
    const create = vi.fn();
    const provider = storage("local", create);
    expect(await persistAIInteractionMetadata(provider, "local-user", result, false)).toBeNull();
    expect(create).not.toHaveBeenCalled();
  });

  it("persists metadata without raw prompts or responses when enabled", async () => {
    const create = vi.fn(async (input) => input);
    const provider = storage("local", create);
    await persistAIInteractionMetadata(provider, "local-user", result, true);
    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      userId: "local-user",
      requestId: result.metadata.requestId,
      promptStored: false,
      responseStored: false
    }));
    const logged = create.mock.calls[0]![0];
    expect(logged).not.toHaveProperty("prompt");
    expect(logged).not.toHaveProperty("response");
    expect(logged).not.toHaveProperty("message");
  });

  it("logs metadata through the repository in Firebase mode", async () => {
    const create = vi.fn(async (input) => input);
    const provider = storage("firebase", create);
    await persistAIInteractionMetadata(provider, "firebase-user", result, false);
    expect(create).toHaveBeenCalledOnce();
  });
});
