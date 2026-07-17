"use client";

import { useState } from "react";
import { REPORT_TYPES } from "@/lib/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { REPORT_TYPE_DESCRIPTIONS, REPORT_TYPE_LABELS } from "./report-labels";
import { reportCreationSchema, type ReportCreationValues } from "./report-form-schema";

export function ReportForm({
  onSubmit
}: {
  onSubmit: (values: ReportCreationValues) => Promise<void>;
}) {
  const [values, setValues] = useState<ReportCreationValues>({
    reportType: "patient-summary",
    startDate: "",
    endDate: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="grid gap-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        const parsed = reportCreationSchema.safeParse(values);
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message ?? "Check the report settings.");
          return;
        }
        setSubmitting(true);
        try {
          await onSubmit(parsed.data);
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : "Unable to create report.");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="report-type">Report type</Label>
        <Select
          id="report-type"
          onChange={(event) => setValues((current) => ({
            ...current,
            reportType: event.target.value as ReportCreationValues["reportType"]
          }))}
          value={values.reportType}
        >
          {REPORT_TYPES.map((reportType) => (
            <option key={reportType} value={reportType}>{REPORT_TYPE_LABELS[reportType]}</option>
          ))}
        </Select>
        <p className="text-sm leading-6 text-muted-foreground">
          {REPORT_TYPE_DESCRIPTIONS[values.reportType]}
        </p>
      </div>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-medium">Optional date range</legend>
        <div className="grid gap-2">
          <Label htmlFor="report-start-date">Start date</Label>
          <Input id="report-start-date" type="date" value={values.startDate} onChange={(event) => setValues((current) => ({ ...current, startDate: event.target.value }))} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="report-end-date">End date</Label>
          <Input id="report-end-date" type="date" value={values.endDate} onChange={(event) => setValues((current) => ({ ...current, endDate: event.target.value }))} />
        </div>
      </fieldset>

      {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
      <div>
        <Button disabled={submitting} type="submit">
          {submitting ? "Creating report..." : "Create and save report"}
        </Button>
      </div>
    </form>
  );
}
