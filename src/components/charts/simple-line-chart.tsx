"use client";

type Point = {
  label: string;
  value: number;
};

type SimpleLineChartProps = {
  data: Point[];
  max?: number;
  height?: number;
};

export function SimpleLineChart({ data, max = 10, height = 160 }: SimpleLineChartProps) {
  if (data.length === 0) {
    return <div className="flex h-40 items-center text-sm text-muted-foreground">No data yet.</div>;
  }

  const width = 420;
  const padding = 24;
  const xStep = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;
  const points = data.map((point, index) => {
    const x = padding + index * xStep;
    const y = height - padding - (Math.min(point.value, max) / max) * (height - padding * 2);
    return { ...point, x, y };
  });
  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <svg aria-label="Pain trend chart" className="h-40 w-full" preserveAspectRatio="none" viewBox={`0 0 ${width} ${height}`}>
      <line stroke="hsl(var(--border))" x1={padding} x2={width - padding} y1={height - padding} y2={height - padding} />
      <line stroke="hsl(var(--border))" x1={padding} x2={padding} y1={padding} y2={height - padding} />
      <polyline fill="none" points={polyline} stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
      {points.map((point) => (
        <circle cx={point.x} cy={point.y} fill="hsl(var(--accent))" key={`${point.label}-${point.x}`} r="4">
          <title>{`${point.label}: ${point.value}`}</title>
        </circle>
      ))}
    </svg>
  );
}
