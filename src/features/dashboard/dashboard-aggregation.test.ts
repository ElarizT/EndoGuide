import { describe, expect, it } from "vitest";
import { aggregateDashboardData, getRecentFlareUps, getTodayPainScore } from "./dashboard-aggregation";
import type { SymptomEntry } from "@/lib/domain";

const base = {
  userId: "demo-user",
  createdAt: "2026-06-05T00:00:00.000Z",
  updatedAt: "2026-06-05T00:00:00.000Z",
  symptomTypes: []
};

describe("dashboard aggregation helpers", () => {
  const symptoms: SymptomEntry[] = [
    {
      ...base,
      id: "s1",
      occurredAt: "2026-06-05T12:00:00.000Z",
      severity: 3,
      painScore: 3
    },
    {
      ...base,
      id: "s2",
      occurredAt: "2026-06-04T12:00:00.000Z",
      severity: 8,
      painScore: 8,
      cycleDay: 18
    }
  ];

  it("finds today's pain score", () => {
    expect(getTodayPainScore(symptoms, new Date("2026-06-05T20:00:00.000Z"))).toBe(3);
  });

  it("finds recent flare-ups", () => {
    expect(getRecentFlareUps(symptoms)).toHaveLength(1);
  });

  it("aggregates dashboard counts and charts", () => {
    const dashboard = aggregateDashboardData({
      symptoms,
      treatments: [
        {
          id: "t1",
          userId: "demo-user",
          createdAt: "2026-06-05T00:00:00.000Z",
          updatedAt: "2026-06-05T00:00:00.000Z",
          name: "Fictional treatment",
          category: "lifestyle"
        }
      ],
      appointments: [],
      documents: [],
      reports: [],
      researchNotes: []
    });

    expect(dashboard.activeTreatments).toHaveLength(1);
    expect(dashboard.painTrendData).toHaveLength(2);
    expect(dashboard.cycleCorrelationData[0]).toMatchObject({ label: "16-20", value: 8 });
  });
});
