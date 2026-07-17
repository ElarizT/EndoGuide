import { z } from "zod";
import type { AIProvider, AIProviderRegistration } from "../types";
import { geminiProviderRegistration } from "./gemini";
import { mockProviderRegistration } from "./mock";
import { unavailableProviderRegistration } from "./unavailable";

const providerIdSchema = z.string().trim().min(1).max(80).regex(/^[a-z0-9][a-z0-9._-]*$/i);

const defaultRegistrations: AIProviderRegistration[] = [
  geminiProviderRegistration,
  mockProviderRegistration,
  unavailableProviderRegistration
];

export type AIProviderRegistryOptions = {
  env?: Record<string, string | undefined>;
  fetchImpl?: typeof fetch;
  registrations?: AIProviderRegistration[];
  providerOverrides?: Record<string, AIProvider>;
};

export function createConfiguredAIProvider(
  options: AIProviderRegistryOptions = {}
): AIProvider {
  const env = options.env ?? process.env;
  const registrations = options.registrations ?? defaultRegistrations;
  const explicit = providerIdSchema.safeParse(env.ENDOGUIDE_AI_PROVIDER);
  const selectedId = explicit.success
    ? explicit.data
    : registrations.find((registration) => registration.autoSelect?.(env))?.id ?? "disabled";

  const override = options.providerOverrides?.[selectedId];
  if (override) return override;

  const registration = registrations.find((candidate) => candidate.id === selectedId)
    ?? registrations.find((candidate) => candidate.id === "disabled")
    ?? unavailableProviderRegistration;

  return registration.create({ env, fetchImpl: options.fetchImpl });
}

export function getDefaultProviderRegistrations() {
  return [...defaultRegistrations];
}
