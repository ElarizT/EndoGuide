"use client";

import type { StorageProvider } from "@/lib/storage";
import type { TreatmentEntry } from "@/lib/domain";
import { treatmentEntrySchema } from "@/lib/validation";
import { createTimelineEventForTreatment } from "@/features/timeline/timeline-service";
import { treatmentFormSchema, type TreatmentFormValues } from "./treatment-form-schema";

function optionalIsoDate(date?: string) {
  return date ? new Date(`${date}T12:00:00.000Z`).toISOString() : undefined;
}

function toDateInputValue(value?: string) {
  return value ? value.slice(0, 10) : "";
}

export function treatmentToFormValues(entry?: TreatmentEntry): TreatmentFormValues {
  return {
    name: entry?.name ?? "",
    category:
      entry?.category === "procedure" || entry?.category === "therapy"
        ? "other"
        : entry?.category ?? "medication",
    startDate: toDateInputValue(entry?.startDate),
    endDate: toDateInputValue(entry?.endDate),
    outcome: entry?.outcome ?? "",
    sideEffects: entry?.sideEffects ?? "",
    reasonStopped: entry?.reasonStopped ?? "",
    doctor: entry?.doctor ?? entry?.prescribingClinicianOptional ?? "",
    clinic: entry?.clinic ?? "",
    notes: entry?.notes ?? ""
  };
}

export function buildTreatmentEntryInput(userId: string, values: TreatmentFormValues) {
  const parsed = treatmentFormSchema.parse(values);

  return treatmentEntrySchema.parse({
    id: crypto.randomUUID(),
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    name: parsed.name,
    category: parsed.category,
    startDate: optionalIsoDate(parsed.startDate),
    endDate: optionalIsoDate(parsed.endDate),
    outcome: parsed.outcome,
    sideEffects: parsed.sideEffects,
    reasonStopped: parsed.reasonStopped,
    doctor: parsed.doctor,
    clinic: parsed.clinic,
    notes: parsed.notes,
    prescribingClinicianOptional: parsed.doctor
  });
}

export async function createTreatmentEntry(
  storage: StorageProvider,
  userId: string,
  values: TreatmentFormValues
) {
  const input = buildTreatmentEntryInput(userId, values);
  const created = await storage.treatmentEntries.create(input);
  await createTimelineEventForTreatment(storage, {
    userId,
    treatmentId: created.id,
    name: created.name,
    startDate: created.startDate
  });
  return created;
}

export async function updateTreatmentEntry(
  storage: StorageProvider,
  id: string,
  userId: string,
  values: TreatmentFormValues
) {
  const input = buildTreatmentEntryInput(userId, values);
  return storage.treatmentEntries.update(id, {
    ...input,
    userId
  });
}
