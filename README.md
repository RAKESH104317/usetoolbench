# PDFPro Open Source PDF SaaS

This repository contains a local open-source PDF processing stack built without any paid PDF API.

## Stack

- Frontend: React + TypeScript + Vite
- API: FastAPI + Python
- PDF tools: PyMuPDF, LibreOffice, OCRmyPDF, Tesseract, python-docx, openpyxl, Pillow
- Background jobs: Celery + Redis
- Storage: local filesystem with retention cleanup

## Docker Compose workflow

```bash
cp .env.example .env
docker compose up --build
```

Then open:

- Frontend: http://localhost:5173
- API docs: http://localhost:8000/docs

## API endpoints

- `POST /api/v1/files/upload`
- `GET /api/v1/files/{file_id}`
- `POST /api/v1/editor/export`
- `POST /api/v1/pdf/merge`
- `POST /api/v1/pdf/split`
- `POST /api/v1/pdf/rotate`
- `POST /api/v1/pdf/compress`
- `POST /api/v1/pdf/ocr`
- `POST /api/v1/pdf/to-word`
- `POST /api/v1/pdf/to-excel`
- `POST /api/v1/pdf/to-image`
- `POST /api/v1/image/to-pdf`
- `POST /api/v1/word/to-pdf`
- `POST /api/v1/pdf/to-text`
- `GET /api/v1/jobs/{job_id}`
- `GET /api/v1/jobs/{job_id}/download`
- `DELETE /api/v1/files/{file_id}`
- `GET /api/v1/health`

## Local processing flow

Upload PDF
→ FastAPI API
→ worker task
→ PDF operation
→ output file
→ job status
→ secure download
→ retention-based cleanup

## Environment variables

See `.env.example`.

## Notes

- No paid API key is required.
- All conversion work is performed with local open-source tooling.
- Temporary files are cleaned after the configured retention window.
