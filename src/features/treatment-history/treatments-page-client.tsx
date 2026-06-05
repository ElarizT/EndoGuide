"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TreatmentEntry } from "@/lib/domain";
import { getClientServices } from "@/features/shared/client-services";
import { createTreatmentEntry } from "./treatment-service";
import { TreatmentForm } from "./treatment-form";

export function TreatmentsPageClient() {
  const [entries, setEntries] = useState<TreatmentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { user, storage } = await getClientServices();
      const data = await storage.treatmentEntries.listByUser(user.id);
      setEntries(data.sort((a, b) => (b.startDate ?? b.createdAt).localeCompare(a.startDate ?? a.createdAt)));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load treatment history.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const active = useMemo(() => entries.filter((entry) => !entry.endDate), [entries]);
  const past = useMemo(() => entries.filter((entry) => entry.endDate), [entries]);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Add treatment history</CardTitle>
        </CardHeader>
        <CardContent>
          <TreatmentForm
            onSubmit={async (values) => {
              const { user, storage } = await getClientServices();
              await createTreatmentEntry(storage, user.id, values);
              await load();
            }}
            submitLabel="Save treatment"
          />
        </CardContent>
      </Card>

      {loading ? <p className="text-sm text-muted-foreground">Loading treatments...</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <TreatmentList title="Active treatments" entries={active} emptyText="No active treatments recorded." />
      <TreatmentList title="Past treatments" entries={past} emptyText="No past treatments recorded." />

      {entries.length > 0 ? (
        <Button onClick={() => void load()} type="button" variant="secondary">Refresh</Button>
      ) : null}
    </div>
  );
}

function TreatmentList({
  title,
  entries,
  emptyText
}: {
  title: string;
  entries: TreatmentEntry[];
  emptyText: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? <p className="text-sm text-muted-foreground">{emptyText}</p> : null}
        <div className="grid gap-3">
          {entries.map((entry) => (
            <Link className="rounded-md border p-4 hover:bg-muted" href={`/treatments/${entry.id}`} key={entry.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong>{entry.name}</strong>
                <span className="text-sm text-muted-foreground">{entry.category.replace(/-/g, " ")}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {entry.startDate ? new Date(entry.startDate).toLocaleDateString() : "No start date"}
                {entry.endDate ? ` - ${new Date(entry.endDate).toLocaleDateString()}` : ""}
              </p>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
