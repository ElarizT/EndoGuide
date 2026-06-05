"use client";

type Bar = {
  label: string;
  value: number;
};

export function SimpleBarChart({ data, max }: { data: Bar[]; max?: number }) {
  const effectiveMax = max ?? Math.max(1, ...data.map((item) => item.value));

  if (data.length === 0) {
    return <div className="flex h-40 items-center text-sm text-muted-foreground">No data yet.</div>;
  }

  return (
    <div className="flex h-40 items-end gap-2" role="img" aria-label="Bar chart">
      {data.map((item) => (
        <div className="flex min-w-0 flex-1 flex-col items-center gap-2" key={item.label}>
          <div
            className="w-full rounded-t bg-primary"
            style={{ height: `${Math.max(4, (item.value / effectiveMax) * 120)}px` }}
            title={`${item.label}: ${item.value}`}
          />
          <span className="w-full truncate text-center text-xs text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
