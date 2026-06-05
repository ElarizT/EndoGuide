"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SimpleLineChart } from "@/components/charts/simple-line-chart";
import { SymptomHeatmap } from "@/components/charts/symptom-heatmap";
import type { SymptomEntry } from "@/lib/domain";
import { getClientServices } from "@/features/shared/client-services";
import { createSymptomEntry } from "./symptom-service";
import { SymptomForm } from "./symptom-form";

export function SymptomsPageClient() {
  const [entries, setEntries] = useState<SymptomEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { user, storage } = await getClientServices();
      const data = await storage.symptomEntries.listByUser(user.id);
      setEntries(data.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load symptoms.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const chartData = useMemo(
    () =>
      [...entries]
        .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))
        .slice(-14)
        .map((entry) => ({ label: entry.occurredAt.slice(5, 10), value: entry.painScore ?? entry.severity ?? 0 })),
    [entries]
  );

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Daily check-in</CardTitle>
        </CardHeader>
        <CardContent>
          <SymptomForm
            onSubmit={async (values) => {
              const { user, storage } = await getClientServices();
              await createSymptomEntry(storage, user.id, values);
              await load();
            }}
            submitLabel="Save symptom entry"
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pain trend</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleLineChart data={chartData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Symptom heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <SymptomHeatmap data={chartData.map((item) => ({ date: item.label, value: item.value }))} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Symptom history</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-sm text-muted-foreground">Loading symptom entries...</p> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {!loading && !error && entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No symptom entries yet. Your saved check-ins will appear here.</p>
          ) : null}
          <div className="grid gap-3">
            {entries.map((entry) => (
              <Link className="rounded-md border p-4 hover:bg-muted" href={`/symptoms/${entry.id}`} key={entry.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong>{new Date(entry.occurredAt).toLocaleDateString()}</strong>
                  <span className="text-sm text-muted-foreground">Pain {entry.painScore ?? entry.severity ?? "n/a"}/10</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {(entry.painLocations ?? []).map((item) => item.replace(/-/g, " ")).join(", ") || "No locations recorded"}
                </p>
              </Link>
            ))}
          </div>
          {entries.length > 0 ? (
            <div className="mt-4">
              <Button onClick={() => void load()} type="button" variant="secondary">Refresh</Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
