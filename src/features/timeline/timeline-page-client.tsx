"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TimelineEvent } from "@/lib/domain";
import { getClientServices } from "@/features/shared/client-services";

const eventTypes: Array<TimelineEvent["eventType"]> = [
  "symptom",
  "treatment",
  "medication",
  "appointment",
  "procedure",
  "test",
  "report",
  "document",
  "flare-up",
  "note",
  "other"
];

export function TimelinePageClient() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<Set<TimelineEvent["eventType"]>>(new Set());
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { user, storage } = await getClientServices();
      const data = await storage.timelineEvents.listByUser(user.id);
      setEvents(data.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load timeline.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filteredEvents = useMemo(() => {
    if (selectedTypes.size === 0) return events;
    return events.filter((event) => selectedTypes.has(event.eventType));
  }, [events, selectedTypes]);

  function toggleType(type: TimelineEvent["eventType"]) {
    setSelectedTypes((current) => {
      const next = new Set(current);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {eventTypes.map((type) => (
                <Button
                  key={type}
                  onClick={() => toggleType(type)}
                  type="button"
                  variant={selectedTypes.has(type) ? "default" : "secondary"}
                >
                  {labelize(type)}
                </Button>
              ))}
              {selectedTypes.size > 0 ? (
                <Button onClick={() => setSelectedTypes(new Set())} type="button" variant="ghost">Clear</Button>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chronological timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <p className="text-sm text-muted-foreground">Loading timeline...</p> : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {!loading && !error && filteredEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No timeline events match the current filters. New symptoms, treatments, appointments, and documents create timeline entries automatically.
              </p>
            ) : null}
            <div className="grid gap-3">
              {filteredEvents.map((event) => (
                <button
                  className="grid gap-2 rounded-md border p-4 text-left hover:bg-muted"
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  type="button"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong>{event.title}</strong>
                    <span className="text-sm text-muted-foreground">{new Date(event.occurredAt).toLocaleDateString()}</span>
                  </div>
                  <span className="text-xs uppercase tracking-normal text-muted-foreground">{labelize(event.eventType)}</span>
                  {event.description ? <p className="text-sm text-muted-foreground">{event.description}</p> : null}
                </button>
              ))}
            </div>
            {events.length > 0 ? (
              <div className="mt-4">
                <Button onClick={() => void load()} type="button" variant="secondary">Refresh</Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event detail</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedEvent ? (
            <div className="grid gap-3 text-sm">
              <p><strong>Title:</strong> {selectedEvent.title}</p>
              <p><strong>Date:</strong> {new Date(selectedEvent.occurredAt).toLocaleString()}</p>
              <p><strong>Type:</strong> {labelize(selectedEvent.eventType)}</p>
              <p><strong>Description:</strong> {selectedEvent.description || "No description"}</p>
              <p><strong>Source:</strong> {selectedEvent.sourceCollection || "Manual"} {selectedEvent.sourceId || ""}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select an event to view details.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function labelize(value: string) {
  return value.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
