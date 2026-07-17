import { PrintReportClient } from "@/features/reports/print-report-client";

export default async function ReportPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PrintReportClient id={id} />;
}
