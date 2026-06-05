"use client";

import type { Appointment } from "@/lib/domain";
import type { StorageProvider } from "@/lib/storage";
import { appointmentSchema } from "@/lib/validation";
import { createTimelineEventForAppointment } from "@/features/timeline/timeline-service";
import { appointmentFormSchema, type AppointmentFormValues } from "./appointment-form-schema";

function toScheduledIso(date: string, time?: string) {
  const safeTime = time || "12:00";
  return new Date(`${date}T${safeTime}:00.000`).toISOString();
}

function toDate(value?: string) {
  return value ? value.slice(0, 10) : new Date().toISOString().slice(0, 10);
}

function toTime(value?: string) {
  return value ? value.slice(11, 16) : "";
}

function splitLines(value?: string) {
  return value
    ?.split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean) ?? [];
}

export function appointmentToFormValues(appointment?: Appointment): AppointmentFormValues {
  return {
    date: toDate(appointment?.scheduledAt),
    time: toTime(appointment?.scheduledAt),
    clinicianName: appointment?.clinicianName ?? "",
    clinicName: appointment?.clinicName ?? "",
    reason: appointment?.reason ?? "",
    notes: appointment?.notes ?? "",
    status: appointment?.status ?? "upcoming",
    questions: appointment?.questions?.join("\n") ?? "",
    goals: appointment?.preparationFields?.goals ?? "",
    concerns: appointment?.preparationFields?.concerns ?? "",
    medicationsToMention: appointment?.preparationFields?.medicationsToMention ?? "",
    documentsToBring: appointment?.preparationFields?.documentsToBring ?? ""
  };
}

export function buildAppointmentInput(userId: string, values: AppointmentFormValues) {
  const parsed = appointmentFormSchema.parse(values);
  return appointmentSchema.parse({
    id: crypto.randomUUID(),
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scheduledAt: toScheduledIso(parsed.date, parsed.time),
    clinicianName: parsed.clinicianName,
    clinicName: parsed.clinicName,
    reason: parsed.reason,
    questions: splitLines(parsed.questions),
    notes: parsed.notes,
    status: parsed.status,
    preparationFields: {
      goals: parsed.goals,
      concerns: parsed.concerns,
      medicationsToMention: parsed.medicationsToMention,
      documentsToBring: parsed.documentsToBring
    }
  });
}

export async function createAppointment(
  storage: StorageProvider,
  userId: string,
  values: AppointmentFormValues
) {
  const input = buildAppointmentInput(userId, values);
  const created = await storage.appointments.create(input);
  await createTimelineEventForAppointment(storage, { userId, appointment: created });
  return created;
}

export async function updateAppointment(
  storage: StorageProvider,
  id: string,
  userId: string,
  values: AppointmentFormValues
) {
  const input = buildAppointmentInput(userId, values);
  return storage.appointments.update(id, {
    ...input,
    userId
  });
}
