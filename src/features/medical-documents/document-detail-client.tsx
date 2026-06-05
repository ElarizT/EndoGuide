"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MedicalDocument } from "@/lib/domain";
import { LOCAL_FILE_LIMITATION_NOTICE } from "@/lib/files";
import { getClientServices } from "@/features/shared/client-services";
import { DocumentForm } from "./document-form";
import {
  deleteMedicalDocument,
  documentToFormValues,
  updateMedicalDocument
} from "./document-service";

export function DocumentDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [document, setDocument] = useState<MedicalDocument | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { storage } = await getClientServices();
      setDocument(await storage.medicalDocuments.getById(id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load document.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [id]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading document...</p>;
  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!document) return <p className="text-sm text-muted-foreground">Document not found.</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{document.fileName}</CardTitle>
      </CardHeader>
      <CardContent>
        {editing ? (
          <DocumentForm
            initialValues={documentToFormValues(document)}
            onSubmit={async (values) => {
              const { storage } = await getClientServices();
              const updated = await updateMedicalDocument(storage, id, values);
              setDocument(updated);
              setEditing(false);
            }}
            submitLabel="Update document"
          />
        ) : (
          <div className="grid gap-4 text-sm">
            {document.storageMode === "local" ? (
              <p className="rounded-md border bg-muted p-3 leading-6 text-muted-foreground">
                {LOCAL_FILE_LIMITATION_NOTICE}
              </p>
            ) : null}
            <p><strong>Type:</strong> {document.documentType}</p>
            <p><strong>Uploaded:</strong> {new Date(document.uploadedAt).toLocaleDateString()}</p>
            <p><strong>Document date:</strong> {document.documentDate ? new Date(document.documentDate).toLocaleDateString() : "Not recorded"}</p>
            <p><strong>Storage mode:</strong> {document.storageMode}</p>
            <p><strong>File reference:</strong> {document.storagePath || document.fileReference || "Metadata only"}</p>
            <p><strong>Size:</strong> {document.fileSizeBytes ? `${Math.round(document.fileSizeBytes / 1024)} KB` : "Not recorded"}</p>
            <p><strong>Tags:</strong> {document.tags?.join(", ") || "No tags"}</p>
            <p><strong>Categories:</strong> {document.categories?.join(", ") || "No categories"}</p>
            <p><strong>Notes:</strong> {document.notes || "No notes recorded"}</p>
            <div className="rounded-md border bg-muted p-3 text-muted-foreground">
              OCR Pipeline, Medical Entity Extraction, and Automated Timeline Extraction are planned architecture points and are not implemented yet.
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setEditing(true)} type="button">Edit notes and tags</Button>
              <Button
                onClick={async () => {
                  const { storage } = await getClientServices();
                  await deleteMedicalDocument(storage, document);
                  router.push("/documents");
                }}
                type="button"
                variant="secondary"
              >
                Delete
              </Button>
              <Button asChild type="button" variant="ghost"><Link href="/documents">Back</Link></Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
