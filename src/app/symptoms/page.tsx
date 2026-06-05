import { PageShell } from "@/components/layout/page-shell";
import { SymptomsPageClient } from "@/features/symptom-tracking/symptoms-page-client";

export default function SymptomsPage() {
  return (
    <PageShell
      title="Symptoms"
      description="Track self-reported symptoms and patterns for personal organization and appointment preparation."
    >
      <SymptomsPageClient />
    </PageShell>
  );
}
