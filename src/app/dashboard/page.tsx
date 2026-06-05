import { PageShell } from "@/components/layout/page-shell";
import { DashboardClient } from "@/features/dashboard/dashboard-client";

export default function DashboardPage() {
  return (
    <PageShell
      title="Dashboard"
      description="A future overview for recent symptoms, upcoming appointments, documents, and safety-bounded preparation tasks."
    >
      <DashboardClient />
    </PageShell>
  );
}
