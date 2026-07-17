import { MEDICAL_OUTPUT_DISCLAIMER, RESEARCH_OUTPUT_DISCLAIMER } from "@/lib/safety";

const reservedDisclaimers = [MEDICAL_OUTPUT_DISCLAIMER, RESEARCH_OUTPUT_DISCLAIMER];

export function cleanStoredText(value?: string, fallback = "Not recorded") {
  if (!value?.trim()) return fallback;
  return reservedDisclaimers.reduce(
    (text, disclaimer) => text.split(disclaimer).join("[standard disclaimer text omitted from stored content]"),
    value.trim()
  );
}

export function formatDate(value?: string) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  }).format(date);
}

export function labelize(value: string) {
  return value.replace(/-/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

export function joinRecorded(values?: string[]) {
  const cleaned = values?.map((value) => cleanStoredText(value, "")).filter(Boolean) ?? [];
  return cleaned.length ? cleaned.join(", ") : "Not recorded";
}

export function uniqueIds(ids: string[]) {
  return [...new Set(ids)].sort();
}

export function countLabels(values: string[]) {
  const counts = new Map<string, number>();
  for (const value of values) {
    const label = labelize(cleanStoredText(value, "Unspecified"));
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([labelA, countA], [labelB, countB]) => countB - countA || labelA.localeCompare(labelB))
    .map(([label, count]) => `${label}: ${count}`);
}

export function average(values: Array<number | undefined>) {
  const recorded = values.filter((value): value is number => value != null);
  if (!recorded.length) return "Not recorded";
  return (recorded.reduce((sum, value) => sum + value, 0) / recorded.length).toFixed(1);
}
