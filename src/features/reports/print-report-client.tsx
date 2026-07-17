"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { DoctorReport } from "@/lib/domain";
import { getClientServices } from "@/features/shared/client-services";
import { ReportContent } from "./report-detail-client";

export function PrintReportClient({ id }: { id: string }) {
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

  if (loading) return <p>Loading print view...</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  if (!report) return <p>Report not found.</p>;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="print-hidden mb-6 flex justify-end">
        <Button onClick={() => window.print()} type="button">Print or save as PDF</Button>
      </div>
      <ReportContent printable report={report} />
    </div>
  );
}
