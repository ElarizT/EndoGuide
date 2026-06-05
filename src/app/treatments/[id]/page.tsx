import { PageShell } from "@/components/layout/page-shell";
import { TreatmentDetailClient } from "@/features/treatment-history/treatment-detail-client";

export default async function TreatmentDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <PageShell
      title="Treatment detail"
      description="Review, edit, or delete a user-entered treatment history record."
    >
      <TreatmentDetailClient id={id} />
    </PageShell>
  );
}
