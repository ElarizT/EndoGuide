import { z } from "zod";

export const appointmentStatusOptions = ["upcoming", "completed", "cancelled"] as const;

export const appointmentFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  time: z.string().optional(),
  clinicianName: z.string().optional(),
  clinicName: z.string().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(appointmentStatusOptions).default("upcoming"),
  questions: z.string().optional(),
  goals: z.string().optional(),
  concerns: z.string().optional(),
  medicationsToMention: z.string().optional(),
  documentsToBring: z.string().optional()
});

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;
