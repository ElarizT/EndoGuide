import type { DashboardSourceData } from "./dashboard-aggregation";

const now = new Date();

export const fictionalDashboardDemoData: DashboardSourceData = {
  symptoms: Array.from({ length: 10 }).map((_, index) => ({
    id: `demo-symptom-${index}`,
    userId: "demo-user",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    occurredAt: new Date(now.getTime() - (9 - index) * 86400000).toISOString(),
    symptomTypes: ["pelvic"],
    severity: [2, 4, 5, 7, 6, 3, 8, 5, 4, 6][index],
    painScore: [2, 4, 5, 7, 6, 3, 8, 5, 4, 6][index],
    painLocations: ["pelvic"],
    cycleDay: index + 12
  })),
  treatments: [
    {
      id: "demo-treatment-1",
      userId: "demo-user",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      name: "Fictional physiotherapy plan",
      category: "physiotherapy",
      startDate: new Date(now.getTime() - 30 * 86400000).toISOString()
    }
  ],
  appointments: [
    {
      id: "demo-appointment-1",
      userId: "demo-user",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      scheduledAt: new Date(now.getTime() + 7 * 86400000).toISOString(),
      clinicianName: "Dr. Demo",
      questions: ["What should I bring to my appointment?"]
    }
  ],
  documents: [],
  reports: [],
  researchNotes: []
};
