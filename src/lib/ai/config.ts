import { z } from "zod";
import type { AIClientConfig } from "./types";

const tokenSchema = z.coerce.number().int().min(128).max(8192);

export function getAIClientConfig(
  env: Record<string, string | undefined> = process.env
): AIClientConfig {
  const maxOutputTokens = tokenSchema.safeParse(env.ENDOGUIDE_AI_MAX_OUTPUT_TOKENS ?? "1024");

  return {
    maxOutputTokens: maxOutputTokens.success ? maxOutputTokens.data : 1024
  };
}

export const AI_CONFIG_DEFAULTS = {
  maxOutputTokens: 1024
} as const;
