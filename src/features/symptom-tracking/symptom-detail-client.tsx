"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SymptomEntry } from "@/lib/domain";
import { getClientServices } from "@/features/shared/client-services";
import { SymptomForm } from "./symptom-form";
import { symptomToFormValues, updateSymptomEntry } from "./symptom-service";

export function SymptomDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [entry, setEntry] = useState<SymptomEntry | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { user, storage } = await getClientServices();
      setEntry(await storage.symptomEntries.getById(id, user.id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load symptom entry.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [id]);

  async function deleteEntry() {
    const { user, storage } = await getClientServices();
    await storage.symptomEntries.delete(id, user.id);
    router.push("/symptoms");
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading symptom entry...</p>;
  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!entry) return <p className="text-sm text-muted-foreground">Symptom entry not found.</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Symptom entry from {new Date(entry.occurredAt).toLocaleDateString()}</CardTitle>
      </CardHeader>
      <CardContent>
        {editing ? (
          <SymptomForm
            initialValues={symptomToFormValues(entry)}
            onSubmit={async (values) => {
              const { user, storage } = await getClientServices();
              const updated = await updateSymptomEntry(storage, id, user.id, values);
              setEntry(updated);
              setEditing(false);
            }}
            submitLabel="Update symptom entry"
          />
        ) : (
          <div className="grid gap-4 text-sm">
            <p><strong>Pain score:</strong> {entry.painScore ?? entry.severity ?? "n/a"}/10</p>
            <p><strong>Locations:</strong> {(entry.painLocations ?? []).join(", ") || "None recorded"}</p>
            <p><strong>Bleeding:</strong> {entry.bleedingSeverity ?? "Not recorded"}</p>
            <p><strong>Period status:</strong> {entry.periodStatus ?? "Not recorded"}</p>
            <p><strong>Cycle day:</strong> {entry.cycleDay ?? "Not recorded"}</p>
            <p><strong>Notes:</strong> {entry.freeTextNotes || "No notes recorded"}</p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setEditing(true)} type="button">Edit</Button>
              <Button onClick={() => void deleteEntry()} type="button" variant="secondary">Delete</Button>
              <Button asChild type="button" variant="ghost"><Link href="/symptoms">Back</Link></Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
