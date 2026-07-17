import { z } from "zod";
import { REPORT_TYPES } from "@/lib/domain";

const dateInput = z.string().date("Use a valid date.").or(z.literal(""));

export const reportCreationSchema = z.object({
  reportType: z.enum(REPORT_TYPES),
  startDate: dateInput,
  endDate: dateInput
}).superRefine((value, context) => {
  if (value.startDate && value.endDate && value.startDate > value.endDate) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endDate"],
      message: "End date must be on or after the start date."
    });
  }
});

export type ReportCreationValues = z.infer<typeof reportCreationSchema>;
