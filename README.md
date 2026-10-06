# UseToolBench

Fresh production-oriented PDF utility website.

## Tools
- Merge PDF
- Split PDF by page
- Rotate PDF
- Compress PDF
- JPG/PNG/WebP to PDF

## Security
- 25 MB per-file upload limit
- Server-generated job IDs
- No public file listing
- No user-controlled filesystem paths
- Temporary outputs removed after one hour
- Express version header disabled
- One production runtime: Node + Express

## Run
npm ci
npm start

Open http://localhost:10000

## Deploy
Render uses render.yaml and runs the root Node application.

Word/Excel/OCR are not presented as working tools until real processing implementations are added; the previous placeholder conversion behavior has been removed.
