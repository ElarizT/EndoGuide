import { z } from "zod";

export const treatmentTypeOptions = [
  "medication",
  "hormonal-therapy",
  "surgery",
  "physiotherapy",
  "pelvic-floor-therapy",
  "lifestyle",
  "nutrition",
  "other"
] as const;

export const treatmentFormSchema = z.object({
  name: z.string().min(1, "Treatment name is required"),
  category: z.enum(treatmentTypeOptions),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  outcome: z.string().optional(),
  sideEffects: z.string().optional(),
  reasonStopped: z.string().optional(),
  doctor: z.string().optional(),
  clinic: z.string().optional(),
  notes: z.string().optional()
});

export type TreatmentFormValues = z.infer<typeof treatmentFormSchema>;
