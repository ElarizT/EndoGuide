"use client";

import type { SymptomEntry } from "@/lib/domain";
import type { StorageProvider } from "@/lib/storage";
import { symptomEntrySchema } from "@/lib/validation";
import { createTimelineEventForSymptom } from "@/features/timeline/timeline-service";
import { symptomFormSchema, type SymptomFormValues } from "./symptom-form-schema";

function toIsoDate(date: string) {
  return new Date(`${date}T12:00:00.000Z`).toISOString();
}

function toDateInputValue(value?: string) {
  return value ? value.slice(0, 10) : new Date().toISOString().slice(0, 10);
}

function splitList(value?: string) {
  return value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function symptomToFormValues(entry?: SymptomEntry): SymptomFormValues {
  return {
    date: toDateInputValue(entry?.occurredAt),
    painScore: entry?.painScore ?? entry?.severity ?? 0,
    painLocations: entry?.painLocations ?? [],
    bleedingSeverity: entry?.bleedingSeverity ?? "none",
    periodStatus: entry?.periodStatus ?? "unknown",
    cycleDay: entry?.cycleDay ?? "",
    fatigue: entry?.fatigue ?? 0,
    nausea: entry?.nausea ?? 0,
    mood: entry?.mood ?? "neutral",
    sleepQuality: entry?.sleepQuality ?? 0,
    bowelSymptoms: entry?.bowelSymptoms?.join(", ") ?? "",
    bladderSymptoms: entry?.bladderSymptoms?.join(", ") ?? "",
    painDuringSex: entry?.painDuringSex ?? "not-applicable",
    painAfterSex: entry?.painAfterSex ?? "not-applicable",
    workImpact: entry?.workImpact ?? "none",
    schoolImpact: entry?.schoolImpact ?? "not-applicable",
    exerciseImpact: entry?.exerciseImpact ?? "none",
    triggers: entry?.triggers?.join(", ") ?? "",
    reliefMethods: entry?.reliefMethods?.join(", ") ?? "",
    freeTextNotes: entry?.freeTextNotes ?? ""
  };
}

export function buildSymptomEntryInput(userId: string, values: SymptomFormValues) {
  const parsed = symptomFormSchema.parse(values);
  const cycleDay = parsed.cycleDay === "" ? undefined : parsed.cycleDay;

  return symptomEntrySchema.parse({
    id: crypto.randomUUID(),
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    occurredAt: toIsoDate(parsed.date),
    symptomTypes: parsed.painLocations,
    severity: parsed.painScore,
    painScore: parsed.painScore,
    painLocations: parsed.painLocations,
    bodyLocations: parsed.painLocations,
    bleedingSeverity: parsed.bleedingSeverity,
    periodStatus: parsed.periodStatus,
    cycleDay,
    fatigue: parsed.fatigue,
    nausea: parsed.nausea,
    mood: parsed.mood,
    sleepQuality: parsed.sleepQuality,
    bowelSymptoms: splitList(parsed.bowelSymptoms),
    bladderSymptoms: splitList(parsed.bladderSymptoms),
    painDuringSex: parsed.painDuringSex,
    painAfterSex: parsed.painAfterSex,
    workImpact: parsed.workImpact,
    schoolImpact: parsed.schoolImpact,
    exerciseImpact: parsed.exerciseImpact,
    triggers: splitList(parsed.triggers),
    reliefMethods: splitList(parsed.reliefMethods),
    freeTextNotes: parsed.freeTextNotes
  });
}

export async function createSymptomEntry(
  storage: StorageProvider,
  userId: string,
  values: SymptomFormValues
) {
  const input = buildSymptomEntryInput(userId, values);
  const created = await storage.symptomEntries.create(input);
  await createTimelineEventForSymptom(storage, {
    userId,
    symptomId: created.id,
    occurredAt: created.occurredAt,
    painScore: created.painScore ?? created.severity
  });
  return created;
}

export async function updateSymptomEntry(
  storage: StorageProvider,
  id: string,
  userId: string,
  values: SymptomFormValues
) {
  const input = buildSymptomEntryInput(userId, values);
  return storage.symptomEntries.update(id, userId, {
    ...input,
  });
}
