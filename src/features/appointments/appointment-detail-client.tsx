"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Appointment } from "@/lib/domain";
import { getClientServices } from "@/features/shared/client-services";
import { renderMedicalDisclaimer } from "@/features/appointment-preparation/disclaimer";
import { generateAppointmentPreparation } from "@/features/appointment-preparation/preparation-generator";
import { AppointmentForm } from "./appointment-form";
import { appointmentToFormValues, updateAppointment } from "./appointment-service";

export function AppointmentDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [editing, setEditing] = useState(false);
  const [prepMarkdown, setPrepMarkdown] = useState<string | null>(null);
  const [prepHtml, setPrepHtml] = useState<string | null>(null);
  const [prepPageHtml, setPrepPageHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { user, storage } = await getClientServices();
      setAppointment(await storage.appointments.getById(id, user.id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load appointment.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [id]);

  async function generatePrep() {
    if (!appointment) return;
    const { user, storage } = await getClientServices();
    const [symptoms, treatments, documents, timelineEvents] = await Promise.all([
      storage.symptomEntries.listByUser(user.id),
      storage.treatmentEntries.listByUser(user.id),
      storage.medicalDocuments.listByUser(user.id),
      storage.timelineEvents.listByUser(user.id)
    ]);
    const output = generateAppointmentPreparation({
      appointment,
      symptoms,
      treatments,
      documents,
      timelineEvents
    });
    const report = await storage.doctorReports.create({
      userId: user.id,
      reportType: "doctor-visit",
      title: output.title,
      generatedAt: new Date().toISOString(),
      sections: output.sections.map((section) => ({
        heading: section.heading,
        body: section.items?.length
          ? `${section.body}\n${section.items.map((item) => `- ${item}`).join("\n")}`
          : section.body
      })),
      sourceRecordIds: [
        appointment.id,
        ...symptoms.map((item) => item.id),
        ...treatments.map((item) => item.id),
        ...documents.map((item) => item.id),
        ...timelineEvents.map((item) => item.id)
      ],
      disclaimerIncluded: true,
      generatorVersion: "appointment-preparation-v1"
    });
    const updatedAppointment = await storage.appointments.update(appointment.id, user.id, {
      preparationSummaryId: report.id
    });
    setAppointment(updatedAppointment);
    setPrepMarkdown(output.markdown);
    setPrepHtml(output.printableHtml);
    setPrepPageHtml(output.html);
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading appointment...</p>;
  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!appointment) return <p className="text-sm text-muted-foreground">Appointment not found.</p>;

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{appointment.clinicianName || "Appointment"}</CardTitle>
        </CardHeader>
        <CardContent>
          {editing ? (
            <AppointmentForm
              initialValues={appointmentToFormValues(appointment)}
              onSubmit={async (values) => {
                const { user, storage } = await getClientServices();
                const updated = await updateAppointment(storage, id, user.id, values);
                setAppointment(updated);
                setEditing(false);
              }}
              submitLabel="Update appointment"
            />
          ) : (
            <div className="grid gap-4 text-sm">
              <p><strong>Date:</strong> {appointment.scheduledAt ? new Date(appointment.scheduledAt).toLocaleString() : "Not scheduled"}</p>
              <p><strong>Doctor:</strong> {appointment.clinicianName || "Not recorded"}</p>
              <p><strong>Clinic:</strong> {appointment.clinicName || "Not recorded"}</p>
              <p><strong>Reason:</strong> {appointment.reason || "Not recorded"}</p>
              <p><strong>Status:</strong> {appointment.status || "upcoming"}</p>
              <p><strong>Preparation summary:</strong> {appointment.preparationSummaryId || "Not generated yet"}</p>
              <p><strong>Questions:</strong> {appointment.questions.length ? appointment.questions.join("; ") : "No questions recorded"}</p>
              <p><strong>Notes:</strong> {appointment.notes || "No notes recorded"}</p>
              <p className="rounded-md border bg-muted p-3 text-muted-foreground">{renderMedicalDisclaimer()}</p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => setEditing(true)} type="button">Edit</Button>
                <Button onClick={() => void generatePrep()} type="button" variant="secondary">Generate preparation</Button>
                <Button
                  onClick={async () => {
                    const { user, storage } = await getClientServices();
                    await storage.appointments.delete(id, user.id);
                    router.push("/appointments");
                  }}
                  type="button"
                  variant="secondary"
                >
                  Delete
                </Button>
                <Button asChild type="button" variant="ghost"><Link href="/appointments">Back</Link></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {prepMarkdown ? (
        <Card>
          <CardHeader>
            <CardTitle>Appointment preparation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  const blob = new Blob([prepMarkdown], { type: "text/markdown" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "appointment-preparation.md";
                  link.click();
                  URL.revokeObjectURL(url);
                }}
                type="button"
                variant="secondary"
              >
                Markdown export
              </Button>
              <Button
                onClick={() => {
                  const win = window.open("", "_blank");
                  if (win && prepHtml) {
                    win.document.write(prepHtml);
                    win.document.close();
                  }
                }}
                type="button"
                variant="secondary"
              >
                Printable view
              </Button>
              <Button
                onClick={() => {
                  const win = window.open("", "_blank");
                  if (win && prepPageHtml) {
                    win.document.write(prepPageHtml);
                    win.document.close();
                  }
                }}
                type="button"
                variant="secondary"
              >
                HTML page
              </Button>
            </div>
            <pre className="max-h-[520px] overflow-auto rounded-md border bg-muted p-4 text-sm whitespace-pre-wrap">{prepMarkdown}</pre>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
