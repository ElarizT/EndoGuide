import { describe, expect, it } from "vitest";
import { validateDocumentFile } from "./document-validation";

describe("document validation", () => {
  it("accepts supported medical document file types", () => {
    expect(validateDocumentFile({ name: "scan.pdf", type: "application/pdf", size: 1024 }).ok).toBe(true);
    expect(validateDocumentFile({ name: "image.png", type: "image/png", size: 1024 }).ok).toBe(true);
    expect(validateDocumentFile({ name: "letter.jpg", type: "image/jpeg", size: 1024 }).ok).toBe(true);
    expect(validateDocumentFile({ name: "notes.txt", type: "text/plain", size: 1024 }).ok).toBe(true);
  });

  it("rejects unsupported types and oversized files", () => {
    expect(validateDocumentFile({ name: "sheet.csv", type: "text/csv", size: 1024 }).ok).toBe(false);
    expect(validateDocumentFile({ name: "large.pdf", type: "application/pdf", size: 11 * 1024 * 1024 }).ok).toBe(false);
  });
});
