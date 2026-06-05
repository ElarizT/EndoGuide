import { PageShell } from "@/components/layout/page-shell";
import { TreatmentsPageClient } from "@/features/treatment-history/treatments-page-client";

export default function TreatmentsPage() {
  return (
    <PageShell
      title="Treatments"
      description="Record treatment history as user-entered information. EndoGuide does not recommend treatments."
    >
      <TreatmentsPageClient />
    </PageShell>
  );
}
