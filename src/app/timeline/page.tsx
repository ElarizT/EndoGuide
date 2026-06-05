import { PageShell } from "@/components/layout/page-shell";
import { TimelinePageClient } from "@/features/timeline/timeline-page-client";

export default function TimelinePage() {
  return (
    <PageShell
      title="Timeline"
      description="A chronological view across symptoms, treatments, appointments, documents, tests, reports, and flare-ups."
    >
      <TimelinePageClient />
    </PageShell>
  );
}
