import { z } from "zod";

export const documentTypeOptions = [
  "MRI",
  "Ultrasound",
  "Blood Test",
  "Surgery Report",
  "Referral",
  "Prescription",
  "Clinic Letter",
  "Insurance",
  "Other"
] as const;

export const allowedDocumentMimeTypes = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "text/plain"
] as const;

export const maxDocumentFileSizeBytes = 10 * 1024 * 1024;

export const documentMetadataFormSchema = z.object({
  documentType: z.enum(documentTypeOptions),
  documentDate: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
  categories: z.string().optional()
});

export type DocumentMetadataFormValues = z.infer<typeof documentMetadataFormSchema>;

export function validateDocumentFile(file: Pick<File, "type" | "size" | "name">) {
  if (!allowedDocumentMimeTypes.includes(file.type as (typeof allowedDocumentMimeTypes)[number])) {
    return {
      ok: false as const,
      message: "Upload a PDF, PNG, JPEG, or TXT file."
    };
  }

  if (file.size > maxDocumentFileSizeBytes) {
    return {
      ok: false as const,
      message: "File size must be 10 MB or less."
    };
  }

  return { ok: true as const };
}
