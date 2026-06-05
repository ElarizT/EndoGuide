import { describe, expect, it } from "vitest";
import { MEDICAL_OUTPUT_DISCLAIMER } from "@/lib/safety";
import { renderDisclaimerHtml, renderMedicalDisclaimer } from "./disclaimer";

describe("disclaimer rendering helper", () => {
  it("renders the required medical disclaimer text", () => {
    expect(renderMedicalDisclaimer()).toBe(MEDICAL_OUTPUT_DISCLAIMER);
    expect(renderDisclaimerHtml()).toContain(MEDICAL_OUTPUT_DISCLAIMER);
  });
});
