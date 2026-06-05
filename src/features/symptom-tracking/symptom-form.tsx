"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MEDICAL_OUTPUT_DISCLAIMER } from "@/lib/safety";
import {
  painLocationOptions,
  symptomFormSchema,
  type SymptomFormValues
} from "./symptom-form-schema";
import { symptomToFormValues } from "./symptom-service";

type SymptomFormProps = {
  initialValues?: Partial<SymptomFormValues>;
  onSubmit(values: SymptomFormValues): Promise<void>;
  submitLabel: string;
};

const impactOptions = ["none", "mild", "moderate", "severe", "not-applicable"] as const;

export function SymptomForm({ initialValues, onSubmit, submitLabel }: SymptomFormProps) {
  const [values, setValues] = useState<SymptomFormValues>({
    ...symptomToFormValues(),
    ...initialValues
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function setValue<K extends keyof SymptomFormValues>(key: K, value: SymptomFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    const parsed = symptomFormSchema.safeParse(values);
    if (!parsed.success) {
      setSaving(false);
      setError(parsed.error.issues[0]?.message ?? "Please check the symptom entry form.");
      return;
    }

    try {
      await onSubmit(parsed.data);
      setValues(symptomToFormValues());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save symptom entry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <p className="text-sm leading-6 text-muted-foreground">{MEDICAL_OUTPUT_DISCLAIMER}</p>
      {error ? <p className="rounded-md border border-destructive p-3 text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Date">
          <Input value={values.date} onChange={(event) => setValue("date", event.target.value)} type="date" />
        </Field>
        <Field label="Pain score (0-10)">
          <Input min={0} max={10} value={values.painScore} onChange={(event) => setValue("painScore", Number(event.target.value))} type="number" />
        </Field>
        <Field label="Cycle day">
          <Input min={1} max={120} value={values.cycleDay ?? ""} onChange={(event) => setValue("cycleDay", event.target.value === "" ? "" : Number(event.target.value))} type="number" />
        </Field>
      </div>

      <fieldset className="grid gap-3">
        <legend className="text-sm font-medium">Pain locations</legend>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {painLocationOptions.map((location) => (
            <label className="flex items-center gap-2 rounded-md border p-3 text-sm" key={location}>
              <input
                checked={values.painLocations.includes(location)}
                onChange={(event) => {
                  const next = event.target.checked
                    ? [...values.painLocations, location]
                    : values.painLocations.filter((item) => item !== location);
                  setValue("painLocations", next);
                }}
                type="checkbox"
              />
              {labelize(location)}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Bleeding severity">
          <Select value={values.bleedingSeverity} onChange={(event) => setValue("bleedingSeverity", event.target.value as SymptomFormValues["bleedingSeverity"])}>
            {["none", "spotting", "light", "moderate", "heavy"].map(option)}
          </Select>
        </Field>
        <Field label="Period status">
          <Select value={values.periodStatus} onChange={(event) => setValue("periodStatus", event.target.value as SymptomFormValues["periodStatus"])}>
            {["unknown", "not-period", "pre-period", "period", "post-period"].map(option)}
          </Select>
        </Field>
        <Field label="Mood">
          <Select value={values.mood} onChange={(event) => setValue("mood", event.target.value as SymptomFormValues["mood"])}>
            {["very-low", "low", "neutral", "good", "very-good"].map(option)}
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Fatigue (0-5)">
          <Input min={0} max={5} value={values.fatigue} onChange={(event) => setValue("fatigue", Number(event.target.value))} type="number" />
        </Field>
        <Field label="Nausea (0-5)">
          <Input min={0} max={5} value={values.nausea} onChange={(event) => setValue("nausea", Number(event.target.value))} type="number" />
        </Field>
        <Field label="Sleep quality (0-5)">
          <Input min={0} max={5} value={values.sleepQuality} onChange={(event) => setValue("sleepQuality", Number(event.target.value))} type="number" />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Pain during sex">
          <Select value={values.painDuringSex} onChange={(event) => setValue("painDuringSex", event.target.value as SymptomFormValues["painDuringSex"])}>
            {impactOptions.map(option)}
          </Select>
        </Field>
        <Field label="Pain after sex">
          <Select value={values.painAfterSex} onChange={(event) => setValue("painAfterSex", event.target.value as SymptomFormValues["painAfterSex"])}>
            {impactOptions.map(option)}
          </Select>
        </Field>
        <Field label="Exercise impact">
          <Select value={values.exerciseImpact} onChange={(event) => setValue("exerciseImpact", event.target.value as SymptomFormValues["exerciseImpact"])}>
            {impactOptions.map(option)}
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Work impact">
          <Select value={values.workImpact} onChange={(event) => setValue("workImpact", event.target.value as SymptomFormValues["workImpact"])}>
            {impactOptions.map(option)}
          </Select>
        </Field>
        <Field label="School impact">
          <Select value={values.schoolImpact} onChange={(event) => setValue("schoolImpact", event.target.value as SymptomFormValues["schoolImpact"])}>
            {impactOptions.map(option)}
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Bowel symptoms">
          <Input value={values.bowelSymptoms ?? ""} onChange={(event) => setValue("bowelSymptoms", event.target.value)} placeholder="Comma-separated" />
        </Field>
        <Field label="Bladder symptoms">
          <Input value={values.bladderSymptoms ?? ""} onChange={(event) => setValue("bladderSymptoms", event.target.value)} placeholder="Comma-separated" />
        </Field>
        <Field label="Triggers">
          <Input value={values.triggers ?? ""} onChange={(event) => setValue("triggers", event.target.value)} placeholder="Comma-separated" />
        </Field>
        <Field label="Relief methods">
          <Input value={values.reliefMethods ?? ""} onChange={(event) => setValue("reliefMethods", event.target.value)} placeholder="Comma-separated" />
        </Field>
      </div>

      <Field label="Notes">
        <Textarea value={values.freeTextNotes ?? ""} onChange={(event) => setValue("freeTextNotes", event.target.value)} placeholder="Anything you want to remember for yourself or discuss at an appointment." />
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

function option(value: string) {
  return (
    <option key={value} value={value}>
      {labelize(value)}
    </option>
  );
}
