import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout/page-shell";

export default function HomePage() {
  return (
    <PageShell
      title="EndoGuide"
      description="A private-first foundation for organizing endometriosis-related information, preparing for appointments, and exploring research without making medical decisions."
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm leading-6 text-muted-foreground">
          This foundation phase includes the app shell, storage abstractions,
          Firebase/local mode scaffolding, validation schemas, and safety policy
          constants.
        </p>
        <div>
          <Button asChild>
            <Link href="/dashboard">Open dashboard</Link>
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
