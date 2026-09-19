# PDFPro SaaS Platform

A production-style PDF processing SaaS app with a responsive marketing homepage, conversion tool pages, backend API routes, job tracking, OCR-ready architecture, and local temporary storage.

## Included

- Responsive frontend landing page and tool pages
- Express REST API for PDF conversion workflow
- Structured backend service layer
- Storage helpers and job queue concepts
- OCR and security modules for architecture-ready integration
- Test coverage for config and validation flows

## Run locally

```bash
npm install
cp .env.example .env
npm start
```

Open:

- http://localhost:3000/
- http://localhost:3000/pdf-to-word
- http://localhost:3000/ocr-pdf

## Project structure

- `server.js` — Express entry point
- `backend/` — API, config, jobs, conversion, validation, storage, OCR, security modules
- `frontend/` — page rendering and static assets
- `storage/` — temporary output files
- `tests/` — backend validation and config checks

## Notes

This implementation is a realistic full-stack prototype for a document SaaS app. The conversion layer uses service stubs and local processed output files so the app is fully previewable in a local environment while keeping a clear upgrade path to production providers.
