"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SimpleBarChart } from "@/components/charts/simple-bar-chart";
import { SimpleLineChart } from "@/components/charts/simple-line-chart";
import { SymptomHeatmap } from "@/components/charts/symptom-heatmap";
import { getClientServices } from "@/features/shared/client-services";
import {
  aggregateDashboardData,
  type DashboardSourceData
} from "./dashboard-aggregation";
import { fictionalDashboardDemoData } from "./demo-data";

export function DashboardClient() {
  const [sourceData, setSourceData] = useState<DashboardSourceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { user, storage } = await getClientServices();
        const [symptoms, treatments, appointments, documents, reports, researchNotes] = await Promise.all([
          storage.symptomEntries.listByUser(user.id),
          storage.treatmentEntries.listByUser(user.id),
          storage.appointments.listByUser(user.id),
          storage.medicalDocuments.listByUser(user.id),
          storage.doctorReports.listByUser(user.id),
          storage.researchNotes.listByUser(user.id)
        ]);

        const loaded = { symptoms, treatments, appointments, documents, reports, researchNotes };
        const demoMode = process.env.NEXT_PUBLIC_ENDOGUIDE_DEMO_MODE === "true";
        const hasAnyData = Object.values(loaded).some((items) => items.length > 0);
        setSourceData(!hasAnyData && demoMode ? fictionalDashboardDemoData : loaded);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Unable to load dashboard.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const dashboard = useMemo(
    () => (sourceData ? aggregateDashboardData(sourceData) : null),
    [sourceData]
  );

  if (loading) return <p className="text-sm text-muted-foreground">Loading dashboard...</p>;
  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!dashboard) return <p className="text-sm text-muted-foreground">No dashboard data available.</p>;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric title="Today's pain score" value={dashboard.todayPainScore == null ? "No check-in" : `${dashboard.todayPainScore}/10`} />
        <Metric title="Recent flare-ups" value={dashboard.recentFlareUps.length.toString()} />
        <Metric title="Active treatments" value={dashboard.activeTreatments.length.toString()} />
        <Metric title="Uploaded documents" value={dashboard.uploadedDocumentsCount.toString()} />
        <Metric title="Generated reports" value={dashboard.generatedReportsCount.toString()} />
        <Metric title="Research notes" value={dashboard.researchNotesCount.toString()} />
        <Metric
          title="Latest symptom"
          value={dashboard.latestSymptomEntry ? new Date(dashboard.latestSymptomEntry.occurredAt).toLocaleDateString() : "None"}
        />
        <Metric title="Upcoming appointments" value={dashboard.upcomingAppointments.length.toString()} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild><Link href="/symptoms">Quick check-in</Link></Button>
        <Button disabled type="button" variant="secondary">Generate report</Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Pain trend chart">
          <SimpleLineChart data={dashboard.painTrendData} />
        </ChartCard>
        <ChartCard title="Symptom heatmap">
          <SymptomHeatmap data={dashboard.symptomHeatmapData} />
        </ChartCard>
        <ChartCard title="Cycle correlation chart">
          <SimpleBarChart data={dashboard.cycleCorrelationData} max={10} />
        </ChartCard>
        <ChartCard title="Treatment timeline">
          <SimpleBarChart data={dashboard.treatmentTimelineData} />
        </ChartCard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming appointment</CardTitle>
        </CardHeader>
        <CardContent>
          {dashboard.upcomingAppointments[0] ? (
            <div className="text-sm">
              <p className="font-medium">
                {new Date(dashboard.upcomingAppointments[0].scheduledAt ?? "").toLocaleString()}
              </p>
              <p className="text-muted-foreground">
                {dashboard.upcomingAppointments[0].clinicianName || "Clinician not recorded"}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming appointments recorded.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
