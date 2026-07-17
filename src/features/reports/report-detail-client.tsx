"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DoctorReport } from "@/lib/domain";
import { getClientServices } from "@/features/shared/client-services";
import { exportReportHtml, exportReportMarkdown, getReportDisclaimer, sanitizeReportText, type ReportExport } from "./report-exporters";
import { REPORT_TYPE_LABELS } from "./report-labels";

function downloadExport(output: ReportExport) {
  const blob = new Blob([output.content], { type: `${output.mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = output.fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function ReportDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [report, setReport] = useState<DoctorReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { user, storage } = await getClientServices();
        setReport(await storage.doctorReports.getById(id, user.id));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Unable to load report.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading report...</p>;
  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!report) return <p className="text-sm text-muted-foreground">Report not found.</p>;

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader><CardTitle>{sanitizeReportText(report.title)}</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-sm text-muted-foreground">
            {REPORT_TYPE_LABELS[report.reportType]} · Generated {new Date(report.generatedAt).toLocaleString()} · {report.sourceRecordIds?.length ?? 0} source records
          </p>
          {report.dateRange ? (
            <p className="text-sm text-muted-foreground">
              Date range: {report.dateRange.start?.slice(0, 10) ?? "earliest record"} to {report.dateRange.end?.slice(0, 10) ?? "latest record"}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => downloadExport(exportReportMarkdown(report))} type="button" variant="secondary">Download Markdown</Button>
            <Button onClick={() => downloadExport(exportReportHtml(report))} type="button" variant="secondary">Download HTML</Button>
            <Button asChild type="button" variant="secondary"><Link href={`/reports/${report.id}/print`} target="_blank">Print view</Link></Button>
            <Button
              onClick={async () => {
                const { user, storage } = await getClientServices();
                await storage.doctorReports.delete(report.id, user.id);
                router.push("/reports");
              }}
              type="button"
              variant="ghost"
            >Delete</Button>
            <Button asChild type="button" variant="ghost"><Link href="/reports">Back</Link></Button>
          </div>
        </CardContent>
      </Card>

      <ReportContent report={report} />
    </div>
  );
}

export function ReportContent({ report, printable = false }: { report: DoctorReport; printable?: boolean }) {
  return (
    <article className={printable ? "report-print" : "rounded-lg border bg-card p-6 shadow-sm"}>
      {printable ? <h1 className="mb-6 text-3xl font-semibold">{sanitizeReportText(report.title)}</h1> : null}
      {printable && report.dateRange ? (
        <p className="mb-6 text-sm">
          <strong>Date range:</strong> {report.dateRange.start?.slice(0, 10) ?? "earliest record"} to {report.dateRange.end?.slice(0, 10) ?? "latest record"}
        </p>
      ) : null}
      <div className="grid gap-7">
        {report.sections.map((section, index) => (
          <section className="break-inside-avoid" key={`${section.heading}-${index}`}>
            <h2 className="text-xl font-semibold">{sanitizeReportText(section.heading)}</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{sanitizeReportText(section.body)}</p>
            {section.items?.length ? (
              <ul className="mt-3 list-disc space-y-2 pl-6 text-sm leading-6">
                {section.items.map((item, itemIndex) => <li key={`${item}-${itemIndex}`}>{sanitizeReportText(item)}</li>)}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
      <p className="report-disclaimer mt-8 border-t pt-4 text-sm font-medium leading-6 text-muted-foreground">
        {getReportDisclaimer(report.reportType)}
      </p>
    </article>
  );
}
