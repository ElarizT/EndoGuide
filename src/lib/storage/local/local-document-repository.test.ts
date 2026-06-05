import { describe, expect, it } from "vitest";
import { createLocalStorageProvider } from ".";

describe("local document metadata repository", () => {
  it("stores document metadata without requiring remote file storage", async () => {
    const provider = createLocalStorageProvider();
    const created = await provider.medicalDocuments.create({
      userId: "document-user",
      fileName: "mri.pdf",
      contentType: "application/pdf",
      fileSizeBytes: 2048,
      storageMode: "local",
      fileReference: "local-doc-1",
      uploadedAt: "2026-06-05T12:00:00.000Z",
      documentType: "MRI",
      notes: "Bring to appointment",
      tags: ["imaging"]
    });

    const listed = await provider.medicalDocuments.listByUser("document-user");
    expect(listed).toContainEqual(expect.objectContaining({ id: created.id, documentType: "MRI" }));

    const updated = await provider.medicalDocuments.update(created.id, { notes: "Updated note" });
    expect(updated.notes).toBe("Updated note");
  });
});
