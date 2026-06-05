"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Appointment } from "@/lib/domain";
import { getClientServices } from "@/features/shared/client-services";
import { AppointmentForm } from "./appointment-form";
import { createAppointment } from "./appointment-service";

export function AppointmentsPageClient() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { user, storage } = await getClientServices();
      const data = await storage.appointments.listByUser(user.id);
      setAppointments(data.sort((a, b) => (a.scheduledAt ?? a.createdAt).localeCompare(b.scheduledAt ?? b.createdAt)));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load appointments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const now = new Date().toISOString();
  const upcoming = useMemo(
    () => appointments.filter((item) => (item.status ?? "upcoming") === "upcoming" && (item.scheduledAt ?? now) >= now),
    [appointments, now]
  );
  const past = useMemo(
    () => appointments.filter((item) => item.status === "completed" || (item.scheduledAt ?? now) < now),
    [appointments, now]
  );

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Add appointment</CardTitle>
        </CardHeader>
        <CardContent>
          <AppointmentForm
            onSubmit={async (values) => {
              const { user, storage } = await getClientServices();
              await createAppointment(storage, user.id, values);
              await load();
            }}
            submitLabel="Save appointment"
          />
        </CardContent>
      </Card>

      {loading ? <p className="text-sm text-muted-foreground">Loading appointments...</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <AppointmentList title="Upcoming appointments" appointments={upcoming} emptyText="No upcoming appointments recorded." />
      <AppointmentList title="Past appointments" appointments={past} emptyText="No past appointments recorded." />

      {appointments.length > 0 ? (
        <Button onClick={() => void load()} type="button" variant="secondary">Refresh</Button>
      ) : null}
    </div>
  );
}

function AppointmentList({
  title,
  appointments,
  emptyText
}: {
  title: string;
  appointments: Appointment[];
  emptyText: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? <p className="text-sm text-muted-foreground">{emptyText}</p> : null}
        <div className="grid gap-3">
          {appointments.map((appointment) => (
            <Link className="rounded-md border p-4 hover:bg-muted" href={`/appointments/${appointment.id}`} key={appointment.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong>{appointment.clinicianName || "Appointment"}</strong>
                <span className="text-sm text-muted-foreground">{appointment.scheduledAt ? new Date(appointment.scheduledAt).toLocaleString() : "No date"}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{appointment.reason || appointment.clinicName || "No reason recorded"}</p>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
