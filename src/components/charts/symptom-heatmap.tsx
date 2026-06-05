"use client";

type HeatmapDay = {
  date: string;
  value: number;
};

export function SymptomHeatmap({ data }: { data: HeatmapDay[] }) {
  if (data.length === 0) {
    return <div className="flex h-40 items-center text-sm text-muted-foreground">No symptom entries yet.</div>;
  }

  return (
    <div className="grid grid-cols-7 gap-2" role="img" aria-label="Symptom heatmap">
      {data.slice(-35).map((day) => {
        const opacity = 0.15 + Math.min(day.value, 10) * 0.085;
        return (
          <div
            className="aspect-square rounded border"
            key={day.date}
            style={{ backgroundColor: `hsl(var(--primary) / ${opacity})` }}
            title={`${day.date}: pain ${day.value}`}
          />
        );
      })}
    </div>
  );
}
