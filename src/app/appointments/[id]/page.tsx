import { PageShell } from "@/components/layout/page-shell";
import { AppointmentDetailClient } from "@/features/appointments/appointment-detail-client";

export default async function AppointmentDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <PageShell
      title="Appointment detail"
      description="Review, edit, delete, and generate deterministic appointment preparation."
    >
      <AppointmentDetailClient id={id} />
    </PageShell>
  );
}
