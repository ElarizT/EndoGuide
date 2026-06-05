import { PageShell } from "@/components/layout/page-shell";
import { AppointmentsPageClient } from "@/features/appointments/appointments-page-client";

export default function AppointmentsPage() {
  return (
    <PageShell
      title="Appointments"
      description="Prepare visit notes and questions for discussion with qualified healthcare professionals."
    >
      <AppointmentsPageClient />
    </PageShell>
  );
}
