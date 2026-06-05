"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { MedicalDocument } from "@/lib/domain";
import { LOCAL_FILE_LIMITATION_NOTICE } from "@/lib/files";
import { getClientServices } from "@/features/shared/client-services";
import { createMedicalDocument } from "./document-service";
import { DocumentForm } from "./document-form";

export function DocumentsPageClient() {
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [storageMode, setStorageMode] = useState<string>("local");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { user, storage } = await getClientServices();
      const data = await storage.medicalDocuments.listByUser(user.id);
      setStorageMode(storage.mode);
      setDocuments(data.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load documents.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="grid gap-6">
      {storageMode === "local" ? (
        <p className="rounded-md border bg-muted p-3 text-sm leading-6 text-muted-foreground">
          {LOCAL_FILE_LIMITATION_NOTICE}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Upload document</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentForm
            requireFile
            onSubmit={async (values, file) => {
              if (!file) throw new Error("Choose a file to upload.");
              const { user, storage } = await getClientServices();
              await createMedicalDocument({ storage, userId: user.id, file, values });
              await load();
            }}
            submitLabel="Save document"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Document vault</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-sm text-muted-foreground">Loading documents...</p> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {!loading && !error && documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents yet. Uploaded metadata will appear here.</p>
          ) : null}
          <div className="grid gap-3">
            {documents.map((document) => (
              <Link className="rounded-md border p-4 hover:bg-muted" href={`/documents/${document.id}`} key={document.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong>{document.fileName}</strong>
                  <span className="text-sm text-muted-foreground">{document.documentType}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Uploaded {new Date(document.uploadedAt).toLocaleDateString()} · {document.storageMode}
                </p>
                {document.tags?.length ? (
                  <p className="mt-2 text-xs text-muted-foreground">{document.tags.join(", ")}</p>
                ) : null}
              </Link>
            ))}
          </div>
          {documents.length > 0 ? (
            <div className="mt-4">
              <Button onClick={() => void load()} type="button" variant="secondary">Refresh</Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
