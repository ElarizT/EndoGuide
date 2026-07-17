import { describe, expect, it } from "vitest";
import { MEDICAL_OUTPUT_DISCLAIMER, TREATMENT_RECOMMENDATION_REFUSAL } from "@/lib/safety";
import {
  ASSISTANT_SAFETY_PROMPT,
  DOCTOR_REPORT_PROMPT,
  EVIDENCE_EXTRACTION_PROMPT,
  KNOWLEDGE_GRAPH_PROMPT,
  RED_FLAGS_PROMPT,
  RESEARCH_COPILOT_PROMPT,
  RESEARCH_SUMMARY_PROMPT
} from ".";

describe("prompt system", () => {
  it("embeds the exact safety contract in the active assistant prompt", () => {
    expect(ASSISTANT_SAFETY_PROMPT).toContain(TREATMENT_RECOMMENDATION_REFUSAL);
    expect(ASSISTANT_SAFETY_PROMPT).toContain(MEDICAL_OUTPUT_DISCLAIMER);
    expect(ASSISTANT_SAFETY_PROMPT).toContain("must not diagnose");
  });

  it("provides every requested prompt file while keeping future capabilities inert", () => {
    expect(DOCTOR_REPORT_PROMPT).toContain("not connect");
    expect(RESEARCH_SUMMARY_PROMPT).toContain("not connected");
    expect(RESEARCH_COPILOT_PROMPT).toContain("not be routed");
    expect(EVIDENCE_EXTRACTION_PROMPT).toContain("not active");
    expect(KNOWLEDGE_GRAPH_PROMPT).toContain("Do not create or persist");
    expect(RED_FLAGS_PROMPT).toContain("not diagnose");
  });
});
