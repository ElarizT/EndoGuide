import { PageShell } from "@/components/layout/page-shell";
import { DocumentsPageClient } from "@/features/medical-documents/documents-page-client";

export default function DocumentsPage() {
  return (
    <PageShell
      title="Documents"
      description="Upload, tag, and organize medical records with Firebase or local-only storage."
    >
      <DocumentsPageClient />
    </PageShell>
  );
}
