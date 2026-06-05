"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  documentMetadataFormSchema,
  documentTypeOptions,
  validateDocumentFile,
  type DocumentMetadataFormValues
} from "./document-validation";
import { documentToFormValues } from "./document-service";

type DocumentFormProps = {
  initialValues?: Partial<DocumentMetadataFormValues>;
  requireFile?: boolean;
  onSubmit(values: DocumentMetadataFormValues, file?: File): Promise<void>;
  submitLabel: string;
};

export function DocumentForm({
  initialValues,
  requireFile = false,
  onSubmit,
  submitLabel
}: DocumentFormProps) {
  const [values, setValues] = useState<DocumentMetadataFormValues>({
    ...documentToFormValues(),
    ...initialValues
  });
  const [file, setFile] = useState<File | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function setValue<K extends keyof DocumentMetadataFormValues>(
    key: K,
    value: DocumentMetadataFormValues[K]
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (requireFile && !file) {
      setError("Choose a file to upload.");
      return;
    }

    if (file) {
      const validation = validateDocumentFile(file);
      if (!validation.ok) {
        setError(validation.message);
        return;
      }
    }

    const parsed = documentMetadataFormSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the document form.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit(parsed.data, file);
      setValues(documentToFormValues());
      setFile(undefined);
      event.currentTarget.reset();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save document.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      {error ? <p className="rounded-md border border-destructive p-3 text-sm text-destructive">{error}</p> : null}

      {requireFile ? (
        <Field label="File">
          <Input
            accept=".pdf,.png,.jpg,.jpeg,.txt,application/pdf,image/png,image/jpeg,text/plain"
            onChange={(event) => setFile(event.target.files?.[0])}
            type="file"
          />
        </Field>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Document type">
          <Select
            value={values.documentType}
            onChange={(event) =>
              setValue("documentType", event.target.value as DocumentMetadataFormValues["documentType"])
            }
          >
            {documentTypeOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </Select>
        </Field>
        <Field label="Document date">
          <Input
            value={values.documentDate ?? ""}
            onChange={(event) => setValue("documentDate", event.target.value)}
            type="date"
          />
        </Field>
      </div>

      <Field label="Tags">
        <Input
          value={values.tags ?? ""}
          onChange={(event) => setValue("tags", event.target.value)}
          placeholder="imaging, specialist, follow-up"
        />
      </Field>

      <Field label="Categories">
        <Input
          value={values.categories ?? ""}
          onChange={(event) => setValue("categories", event.target.value)}
          placeholder="records to bring, insurance, recent"
        />
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
