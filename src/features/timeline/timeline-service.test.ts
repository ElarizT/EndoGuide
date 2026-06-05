import { describe, expect, it } from "vitest";
import {
  buildTimelineEventForAppointment,
  buildTimelineEventForDocument
} from "./timeline-service";

describe("timeline event creation helpers", () => {
  it("builds appointment timeline events", () => {
    const event = buildTimelineEventForAppointment({
      userId: "user-1",
      appointment: {
        id: "appointment-1",
        scheduledAt: "2026-06-20T10:00:00.000Z",
        clinicianName: "Dr Demo",
        clinicName: "Demo Clinic",
        reason: "Follow-up"
      }
    });

    expect(event).toMatchObject({
      userId: "user-1",
      eventType: "appointment",
      sourceCollection: "appointments",
      sourceId: "appointment-1"
    });
  });

  it("maps test-like documents to test timeline events", () => {
    const event = buildTimelineEventForDocument({
      userId: "user-1",
      document: {
        id: "doc-1",
        fileName: "blood-test.pdf",
        documentType: "Blood Test",
        uploadedAt: "2026-06-05T12:00:00.000Z"
      }
    });

    expect(event.eventType).toBe("test");
    expect(event.sourceCollection).toBe("medicalDocuments");
  });
});
