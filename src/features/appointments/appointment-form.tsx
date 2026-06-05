"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  appointmentFormSchema,
  appointmentStatusOptions,
  type AppointmentFormValues
} from "./appointment-form-schema";
import { appointmentToFormValues } from "./appointment-service";

type AppointmentFormProps = {
  initialValues?: Partial<AppointmentFormValues>;
  onSubmit(values: AppointmentFormValues): Promise<void>;
  submitLabel: string;
};

export function AppointmentForm({ initialValues, onSubmit, submitLabel }: AppointmentFormProps) {
  const [values, setValues] = useState<AppointmentFormValues>({
    ...appointmentToFormValues(),
    ...initialValues
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function setValue<K extends keyof AppointmentFormValues>(key: K, value: AppointmentFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = appointmentFormSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the appointment form.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit(parsed.data);
      setValues(appointmentToFormValues());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save appointment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <p className="rounded-md border bg-muted p-3 text-sm leading-6 text-muted-foreground">
        Appointment preparation organizes your own records and questions. It does not diagnose or recommend treatment, medication, or surgery.
      </p>
      {error ? <p className="rounded-md border border-destructive p-3 text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Date">
          <Input value={values.date} onChange={(event) => setValue("date", event.target.value)} type="date" />
        </Field>
        <Field label="Time">
          <Input value={values.time ?? ""} onChange={(event) => setValue("time", event.target.value)} type="time" />
        </Field>
        <Field label="Status">
          <Select value={values.status} onChange={(event) => setValue("status", event.target.value as AppointmentFormValues["status"])}>
            {appointmentStatusOptions.map((status) => (
              <option key={status} value={status}>{labelize(status)}</option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Doctor">
          <Input value={values.clinicianName ?? ""} onChange={(event) => setValue("clinicianName", event.target.value)} />
        </Field>
        <Field label="Clinic">
          <Input value={values.clinicName ?? ""} onChange={(event) => setValue("clinicName", event.target.value)} />
        </Field>
      </div>

      <Field label="Reason">
        <Input value={values.reason ?? ""} onChange={(event) => setValue("reason", event.target.value)} />
      </Field>
      <Field label="Questions">
        <Textarea value={values.questions ?? ""} onChange={(event) => setValue("questions", event.target.value)} placeholder="One question per line" />
      </Field>
      <Field label="Notes">
        <Textarea value={values.notes ?? ""} onChange={(event) => setValue("notes", event.target.value)} />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Goals">
          <Textarea value={values.goals ?? ""} onChange={(event) => setValue("goals", event.target.value)} />
        </Field>
        <Field label="Concerns">
          <Textarea value={values.concerns ?? ""} onChange={(event) => setValue("concerns", event.target.value)} />
        </Field>
        <Field label="Medications to mention">
          <Textarea value={values.medicationsToMention ?? ""} onChange={(event) => setValue("medicationsToMention", event.target.value)} />
        </Field>
        <Field label="Documents to bring">
          <Textarea value={values.documentsToBring ?? ""} onChange={(event) => setValue("documentsToBring", event.target.value)} />
        </Field>
      </div>

      <div>
        <Button disabled={saving} type="submit">{saving ? "Saving..." : submitLabel}</Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function labelize(value: string) {
  return value.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
