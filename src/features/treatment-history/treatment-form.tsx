"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TREATMENT_RECOMMENDATION_REFUSAL } from "@/lib/safety";
import {
  treatmentFormSchema,
  treatmentTypeOptions,
  type TreatmentFormValues
} from "./treatment-form-schema";
import { treatmentToFormValues } from "./treatment-service";

type TreatmentFormProps = {
  initialValues?: Partial<TreatmentFormValues>;
  onSubmit(values: TreatmentFormValues): Promise<void>;
  submitLabel: string;
};

export function TreatmentForm({ initialValues, onSubmit, submitLabel }: TreatmentFormProps) {
  const [values, setValues] = useState<TreatmentFormValues>({
    ...treatmentToFormValues(),
    ...initialValues
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function setValue<K extends keyof TreatmentFormValues>(key: K, value: TreatmentFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    const parsed = treatmentFormSchema.safeParse(values);
    if (!parsed.success) {
      setSaving(false);
      setError(parsed.error.issues[0]?.message ?? "Please check the treatment form.");
      return;
    }

    try {
      await onSubmit(parsed.data);
      setValues(treatmentToFormValues());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save treatment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <p className="rounded-md border bg-muted p-3 text-sm leading-6 text-muted-foreground">
        Treatment history organizes user-entered information only. EndoGuide does not evaluate treatment correctness or recommend continuing, stopping, or changing treatment.
      </p>
      <p className="text-sm leading-6 text-muted-foreground">{TREATMENT_RECOMMENDATION_REFUSAL}</p>
      {error ? <p className="rounded-md border border-destructive p-3 text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Treatment name">
          <Input value={values.name} onChange={(event) => setValue("name", event.target.value)} />
        </Field>
        <Field label="Treatment type">
          <Select value={values.category} onChange={(event) => setValue("category", event.target.value as TreatmentFormValues["category"])}>
            {treatmentTypeOptions.map((value) => (
              <option key={value} value={value}>{labelize(value)}</option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Start date">
          <Input value={values.startDate ?? ""} onChange={(event) => setValue("startDate", event.target.value)} type="date" />
        </Field>
        <Field label="End date">
          <Input value={values.endDate ?? ""} onChange={(event) => setValue("endDate", event.target.value)} type="date" />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Doctor">
          <Input value={values.doctor ?? ""} onChange={(event) => setValue("doctor", event.target.value)} />
        </Field>
        <Field label="Clinic">
          <Input value={values.clinic ?? ""} onChange={(event) => setValue("clinic", event.target.value)} />
        </Field>
      </div>

      <Field label="Outcome">
        <Textarea value={values.outcome ?? ""} onChange={(event) => setValue("outcome", event.target.value)} placeholder="Record your own notes. Do not use this as medical advice." />
      </Field>
      <Field label="Side effects">
        <Textarea value={values.sideEffects ?? ""} onChange={(event) => setValue("sideEffects", event.target.value)} />
      </Field>
      <Field label="Reason stopped">
        <Input value={values.reasonStopped ?? ""} onChange={(event) => setValue("reasonStopped", event.target.value)} />
      </Field>
      <Field label="Notes">
        <Textarea value={values.notes ?? ""} onChange={(event) => setValue("notes", event.target.value)} />
      </Field>

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
