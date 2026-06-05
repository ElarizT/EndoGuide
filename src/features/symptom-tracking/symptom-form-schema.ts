import { z } from "zod";

export const painLocationOptions = [
  "pelvic",
  "abdomen",
  "lower-back",
  "legs",
  "bowel",
  "bladder",
  "other"
] as const;

export const symptomFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  painScore: z.coerce.number().int().min(0).max(10),
  painLocations: z.array(z.enum(painLocationOptions)).default([]),
  bleedingSeverity: z.enum(["none", "spotting", "light", "moderate", "heavy"]).optional(),
  periodStatus: z.enum(["not-period", "period", "pre-period", "post-period", "unknown"]).optional(),
  cycleDay: z.coerce.number().int().min(1).max(120).optional().or(z.literal("")),
  fatigue: z.coerce.number().int().min(0).max(5).optional(),
  nausea: z.coerce.number().int().min(0).max(5).optional(),
  mood: z.enum(["very-low", "low", "neutral", "good", "very-good"]).optional(),
  sleepQuality: z.coerce.number().int().min(0).max(5).optional(),
  bowelSymptoms: z.string().optional(),
  bladderSymptoms: z.string().optional(),
  painDuringSex: z.enum(["none", "mild", "moderate", "severe", "not-applicable"]).optional(),
  painAfterSex: z.enum(["none", "mild", "moderate", "severe", "not-applicable"]).optional(),
  workImpact: z.enum(["none", "mild", "moderate", "severe", "not-applicable"]).optional(),
  schoolImpact: z.enum(["none", "mild", "moderate", "severe", "not-applicable"]).optional(),
  exerciseImpact: z.enum(["none", "mild", "moderate", "severe", "not-applicable"]).optional(),
  triggers: z.string().optional(),
  reliefMethods: z.string().optional(),
  freeTextNotes: z.string().optional()
});

export type SymptomFormValues = z.infer<typeof symptomFormSchema>;
