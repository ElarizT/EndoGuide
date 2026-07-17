"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DoctorReport } from "@/lib/domain";
import { getClientServices } from "@/features/shared/client-services";
import { ReportForm } from "./report-form";
import { REPORT_TYPE_LABELS } from "./report-labels";
import { createReport } from "./report-service";

export function ReportsPageClient() {
  const router = useRouter();
  const [reports, setReports] = useState<DoctorReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { user, storage } = await getClientServices();
        const records = await storage.doctorReports.listByUser(user.id);
        setReports(records.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt)));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Unable to load reports.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader><CardTitle>Create report</CardTitle></CardHeader>
        <CardContent>
          <ReportForm
            onSubmit={async (values) => {
              const { user, storage } = await getClientServices();
              const report = await createReport(storage, user.id, values);
              router.push(`/reports/${report.id}`);
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Saved reports</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="text-sm text-muted-foreground">Loading reports...</p> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {!loading && !error && reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reports yet. Create one from the records already stored in EndoGuide.</p>
          ) : null}
          <div className="grid gap-3">
            {reports.map((report) => (
              <Link className="rounded-md border p-4 hover:bg-muted" href={`/reports/${report.id}`} key={report.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong>{report.title}</strong>
                  <span className="text-sm text-muted-foreground">{REPORT_TYPE_LABELS[report.reportType]}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Generated {new Date(report.generatedAt).toLocaleString()} · {report.sourceRecordIds?.length ?? 0} source records
                </p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
