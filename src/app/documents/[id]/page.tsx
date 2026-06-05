import { PageShell } from "@/components/layout/page-shell";
import { DocumentDetailClient } from "@/features/medical-documents/document-detail-client";

export default async function DocumentDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <PageShell
      title="Document detail"
      description="Review document metadata, notes, tags, and storage reference."
    >
      <DocumentDetailClient id={id} />
    </PageShell>
  );
}
