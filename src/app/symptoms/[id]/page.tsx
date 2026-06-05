import { PageShell } from "@/components/layout/page-shell";
import { SymptomDetailClient } from "@/features/symptom-tracking/symptom-detail-client";

export default async function SymptomDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <PageShell
      title="Symptom detail"
      description="Review, edit, or delete a user-entered symptom record."
    >
      <SymptomDetailClient id={id} />
    </PageShell>
  );
}
