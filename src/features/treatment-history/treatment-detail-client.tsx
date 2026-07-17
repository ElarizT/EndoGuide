"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TreatmentEntry } from "@/lib/domain";
import { getClientServices } from "@/features/shared/client-services";
import { TreatmentForm } from "./treatment-form";
import { treatmentToFormValues, updateTreatmentEntry } from "./treatment-service";

export function TreatmentDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [entry, setEntry] = useState<TreatmentEntry | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { user, storage } = await getClientServices();
      setEntry(await storage.treatmentEntries.getById(id, user.id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load treatment.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [id]);

  async function deleteEntry() {
    const { user, storage } = await getClientServices();
    await storage.treatmentEntries.delete(id, user.id);
    router.push("/treatments");
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading treatment...</p>;
  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!entry) return <p className="text-sm text-muted-foreground">Treatment not found.</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{entry.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {editing ? (
          <TreatmentForm
            initialValues={treatmentToFormValues(entry)}
            onSubmit={async (values) => {
              const { user, storage } = await getClientServices();
              const updated = await updateTreatmentEntry(storage, id, user.id, values);
              setEntry(updated);
              setEditing(false);
            }}
            submitLabel="Update treatment"
          />
        ) : (
          <div className="grid gap-4 text-sm">
            <p><strong>Type:</strong> {entry.category.replace(/-/g, " ")}</p>
            <p><strong>Dates:</strong> {entry.startDate ? new Date(entry.startDate).toLocaleDateString() : "No start date"}{entry.endDate ? ` - ${new Date(entry.endDate).toLocaleDateString()}` : ""}</p>
            <p><strong>Doctor:</strong> {entry.doctor || entry.prescribingClinicianOptional || "Not recorded"}</p>
            <p><strong>Clinic:</strong> {entry.clinic || "Not recorded"}</p>
            <p><strong>Outcome:</strong> {entry.outcome || "Not recorded"}</p>
            <p><strong>Side effects:</strong> {entry.sideEffects || "Not recorded"}</p>
            <p><strong>Reason stopped:</strong> {entry.reasonStopped || "Not recorded"}</p>
            <p><strong>Notes:</strong> {entry.notes || "No notes recorded"}</p>
            <div className="rounded-md border bg-muted p-3 text-muted-foreground">
              EndoGuide stores this as user-entered history only and does not judge whether a treatment was appropriate.
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setEditing(true)} type="button">Edit</Button>
              <Button onClick={() => void deleteEntry()} type="button" variant="secondary">Delete</Button>
              <Button asChild type="button" variant="ghost"><Link href="/treatments">Back</Link></Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
