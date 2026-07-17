import { PageShell } from "@/components/layout/page-shell";
import { ReportDetailClient } from "@/features/reports/report-detail-client";

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PageShell title="Report detail" description="Review a saved report and export it as Markdown, HTML, or a printable document.">
      <ReportDetailClient id={id} />
    </PageShell>
  );
}
