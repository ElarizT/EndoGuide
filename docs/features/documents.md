# Medical Document Vault

## Status

Implemented for Phase 3.

## Supported Uploads

- PDF
- PNG
- JPEG
- TXT

Files are validated by MIME type and capped at 10 MB.

## Metadata

Document metadata is stored through the `medicalDocuments` repository in both Firebase and local-only modes.

Stored fields include:

- File name
- Content type
- File size
- Upload date
- Document date
- Document type
- Notes
- Tags
- Categories
- Storage mode
- Storage path or local file reference when available

Document types:

- MRI
- Ultrasound
- Blood Test
- Surgery Report
- Referral
- Prescription
- Clinic Letter
- Insurance
- Other

## File Storage

Firebase mode uploads file bytes to Firebase Storage and stores the resulting path in Firestore metadata.

Local-only mode stores metadata in IndexedDB and stores file bytes as IndexedDB Blobs when available. The UI warns that local files are tied to the browser profile, are not synced, and may be removed if browser site data is cleared.

## User Interface

Implemented screens:

- Upload form
- Document list
- Document detail page
- Edit notes, tags, categories, and document type
- Delete document metadata and associated file reference

## Future Architecture

TODO:

- OCR Pipeline
- Medical Entity Extraction
- Automated Timeline Extraction

These are intentionally not implemented in Phase 3.
