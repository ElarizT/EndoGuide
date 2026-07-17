import { PageShell } from "@/components/layout/page-shell";
import { ReportsPageClient } from "@/features/reports/reports-page-client";

export default function ReportsPage() {
  return (
    <PageShell
      title="Reports"
      description="Create deterministic organizational reports from records already stored in EndoGuide. Reports do not diagnose or recommend care."
    >
      <ReportsPageClient />
    </PageShell>
  );
}
