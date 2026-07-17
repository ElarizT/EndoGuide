import { z } from "zod";
import { AI_SAFETY_CLASSIFICATIONS } from "@/lib/domain";

export const aiChatRequestSchema = z.object({
  feature: z.literal("assistant").default("assistant"),
  message: z.string().trim().min(1, "Enter a message.").max(4000, "Messages are limited to 4,000 characters.")
}).strict();

const tokenUsageSchema = z.object({
  input: z.number().int().nonnegative().optional(),
  output: z.number().int().nonnegative().optional(),
  total: z.number().int().nonnegative().optional()
}).optional();

export const aiInteractionMetadataSchema = z.object({
  requestId: z.string().uuid(),
  feature: z.literal("assistant"),
  provider: z.string().trim().min(1).max(80).optional(),
  model: z.string().optional(),
  safetyClassification: z.enum(AI_SAFETY_CLASSIFICATIONS),
  blocked: z.boolean(),
  disclaimerIncluded: z.boolean(),
  tokenUsage: tokenUsageSchema,
  promptStored: z.literal(false),
  responseStored: z.literal(false)
});

export const aiClientResultSchema = z.object({
  status: z.enum(["allowed", "blocked", "unavailable", "error"]),
  message: z.string().min(1).max(20000),
  metadata: aiInteractionMetadataSchema
});

export type AIChatRequest = z.infer<typeof aiChatRequestSchema>;
