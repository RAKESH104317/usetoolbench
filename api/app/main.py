import os
import shutil
import uuid
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from .config import ALLOWED_EXTENSIONS, CORS_ORIGINS, OUTPUT_DIR, UPLOAD_DIR
from .processor import (
    compress_pdf,
    image_to_pdf,
    merge_pdf,
    ocr_pdf,
    pdf_to_excel,
    pdf_to_image,
    pdf_to_text,
    pdf_to_word,
    rotate_pdf,
    split_pdf,
    word_to_pdf,
)
from .storage import cleanup_expired_files, create_file_record, delete_file, ensure_directories

app = FastAPI(title="PDFPro API", version="1.0.0", docs_url="/docs", redoc_url="/redoc")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

JOBS: dict[str, dict[str, Any]] = {}


def _allowed(filename: str) -> bool:
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS


def _find_file(file_id: str) -> Path | None:
    for directory in [UPLOAD_DIR, OUTPUT_DIR]:
        for candidate in directory.iterdir():
            if candidate.name.startswith(f"{file_id}-"):
                return candidate
    return None


def _job_result(job_id: str, operation: str, output_path: str | list[str] | None, status: str = "completed") -> dict[str, Any]:
    payload = {
        "job_id": job_id,
        "operation": operation,
        "status": status,
    }
    if isinstance(output_path, list):
        payload["output_files"] = output_path
        payload["download_url"] = output_path[0] if output_path else None
    elif output_path:
        payload["output_file"] = output_path
        payload["download_url"] = f"/api/v1/jobs/{job_id}/download"
    return payload


def _run_processing_task(operation: str, source_path: str, **kwargs):
    if operation == "pdf_to_word":
        return pdf_to_word(source_path, kwargs.get("output_name", "converted.docx"))
    if operation == "pdf_to_text":
        return pdf_to_text(source_path, kwargs.get("output_name", "converted.txt"))
    if operation == "pdf_to_excel":
        return pdf_to_excel(source_path, kwargs.get("output_name", "converted.xlsx"))
    if operation == "pdf_to_image":
        return pdf_to_image(source_path, kwargs.get("output_name", "converted-page"))
    if operation == "image_to_pdf":
        return image_to_pdf(source_path, kwargs.get("output_name", "converted.pdf"))
    if operation == "word_to_pdf":
        return word_to_pdf(source_path, kwargs.get("output_name", "converted.pdf"))
    if operation == "merge_pdf":
        return merge_pdf(kwargs.get("pdf_paths", []), kwargs.get("output_name", "merged.pdf"))
    if operation == "split_pdf":
        return split_pdf(source_path, kwargs.get("output_prefix", "split"), kwargs.get("page_ranges"))
    if operation == "rotate_pdf":
        return rotate_pdf(source_path, kwargs.get("output_name", "rotated.pdf"), int(kwargs.get("angle", 90)))
    if operation == "compress_pdf":
        return compress_pdf(source_path, kwargs.get("output_name", "compressed.pdf"))
    if operation == "ocr_pdf":
        return ocr_pdf(source_path, kwargs.get("output_name", "ocr.pdf"))
    raise ValueError(f"Unsupported operation: {operation}")


@app.on_event("startup")
def startup_event() -> None:
    ensure_directories()
    cleanup_expired_files()


@app.get("/api/v1/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "pdfpro-api"}


@app.post("/api/v1/files/upload")
async def upload_file(file: UploadFile = File(...)) -> dict[str, Any]:
    if not file.filename:
        raise HTTPException(status_code=400, detail="File is required")
    if not _allowed(file.filename):
        raise HTTPException(status_code=400, detail="Unsupported file type")
    data = await file.read()
    record = create_file_record(data, file.filename, "uploads")
    return {
        "file_id": record["file_id"],
        "filename": record["filename"],
        "path": record["path"],
        "size": record["size"],
        "status": "uploaded",
    }


@app.get("/api/v1/files/{file_id}")
def get_file(file_id: str) -> dict[str, Any]:
    record = _find_file(file_id)
    if record is None:
        raise HTTPException(status_code=404, detail="File not found")
    return {
        "file_id": file_id,
        "filename": record.name,
        "path": str(record),
        "size": record.stat().st_size,
    }


@app.delete("/api/v1/files/{file_id}")
def delete_file_by_id(file_id: str) -> dict[str, str]:
    record = _find_file(file_id)
    if record is None:
        raise HTTPException(status_code=404, detail="File not found")
    record.unlink(missing_ok=True)
    return {"status": "deleted", "file_id": file_id}


@app.post("/api/v1/editor/export")
async def export_editor_file(file_id: str = Form(...), filename: str = Form("edited.pdf")) -> dict[str, Any]:
    source = _find_file(file_id)
    if source is None:
        raise HTTPException(status_code=404, detail="Input file not found")
    output_name = str(filename).strip() or "edited.pdf"
    output_path = str(OUTPUT_DIR / output_name)
    shutil.copy2(source, output_path)
    job_id = str(uuid.uuid4())
    JOBS[job_id] = {"status": "completed", "output_file": output_path, "operation": "editor_export"}
    return {
        "status": "completed",
        "job_id": job_id,
        "output_file": output_path,
        "download_url": f"/api/v1/jobs/{job_id}/download",
    }


@app.post("/api/v1/pdf/merge")
async def merge(file_ids: str = Form(...), output_name: str = Form("merged.pdf")) -> dict[str, Any]:
    ids = [item.strip() for item in file_ids.split(",") if item.strip()]
    pdf_paths = []
    for file_id in ids:
        record = _find_file(file_id)
        if record is None:
            raise HTTPException(status_code=404, detail=f"File {file_id} not found")
        pdf_paths.append(str(record))
    job_id = str(uuid.uuid4())
    result = _run_processing_task("merge_pdf", pdf_paths[0], pdf_paths=pdf_paths, output_name=output_name)
    JOBS[job_id] = {"status": "completed", "operation": "merge_pdf", "output_file": result}
    return _job_result(job_id, "merge_pdf", result)


@app.post("/api/v1/pdf/split")
async def split(file_id: str = Form(...), page_ranges: str = Form("1"), output_prefix: str = Form("split")) -> dict[str, Any]:
    source = _find_file(file_id)
    if source is None:
        raise HTTPException(status_code=404, detail="File not found")
    job_id = str(uuid.uuid4())
    result = _run_processing_task("split_pdf", str(source), page_ranges=[int(page) for page in page_ranges.split(",") if page.strip()], output_prefix=output_prefix)
    JOBS[job_id] = {"status": "completed", "operation": "split_pdf", "output_files": result}
    return _job_result(job_id, "split_pdf", result)


@app.post("/api/v1/pdf/rotate")
async def rotate(file_id: str = Form(...), angle: int = Form(90), output_name: str = Form("rotated.pdf")) -> dict[str, Any]:
    source = _find_file(file_id)
    if source is None:
        raise HTTPException(status_code=404, detail="File not found")
    job_id = str(uuid.uuid4())
    result = _run_processing_task("rotate_pdf", str(source), angle=angle, output_name=output_name)
    JOBS[job_id] = {"status": "completed", "operation": "rotate_pdf", "output_file": result}
    return _job_result(job_id, "rotate_pdf", result)


@app.post("/api/v1/pdf/compress")
async def compress(file_id: str = Form(...), output_name: str = Form("compressed.pdf")) -> dict[str, Any]:
    source = _find_file(file_id)
    if source is None:
        raise HTTPException(status_code=404, detail="File not found")
    job_id = str(uuid.uuid4())
    result = _run_processing_task("compress_pdf", str(source), output_name=output_name)
    JOBS[job_id] = {"status": "completed", "operation": "compress_pdf", "output_file": result}
    return _job_result(job_id, "compress_pdf", result)


@app.post("/api/v1/pdf/ocr")
async def ocr(file_id: str = Form(...), output_name: str = Form("ocr.pdf")) -> dict[str, Any]:
    source = _find_file(file_id)
    if source is None:
        raise HTTPException(status_code=404, detail="File not found")
    job_id = str(uuid.uuid4())
    result = _run_processing_task("ocr_pdf", str(source), output_name=output_name)
    JOBS[job_id] = {"status": "completed", "operation": "ocr_pdf", "output_file": result}
    return _job_result(job_id, "ocr_pdf", result)


@app.post("/api/v1/pdf/to-word")
async def convert_pdf_to_word(file: UploadFile = File(...)) -> dict[str, Any]:
    if not file.filename or not _allowed(file.filename):
        raise HTTPException(status_code=400, detail="Invalid PDF file")
    data = await file.read()
    record = create_file_record(data, file.filename, "uploads")
    source_path = record["path"]
    output_name = f"{Path(file.filename).stem}-converted.docx"
    job_id = str(uuid.uuid4())
    result = _run_processing_task("pdf_to_word", source_path, output_name=output_name)
    JOBS[job_id] = {"status": "completed", "operation": "pdf_to_word", "output_file": result}
    return _job_result(job_id, "pdf_to_word", result)


@app.post("/api/v1/pdf/to-excel")
async def convert_pdf_to_excel(file: UploadFile = File(...)) -> dict[str, Any]:
    if not file.filename or not _allowed(file.filename):
        raise HTTPException(status_code=400, detail="Invalid PDF file")
    data = await file.read()
    record = create_file_record(data, file.filename, "uploads")
    output_name = f"{Path(file.filename).stem}-converted.xlsx"
    job_id = str(uuid.uuid4())
    result = _run_processing_task("pdf_to_excel", record["path"], output_name=output_name)
    JOBS[job_id] = {"status": "completed", "operation": "pdf_to_excel", "output_file": result}
    return _job_result(job_id, "pdf_to_excel", result)


@app.post("/api/v1/pdf/to-image")
async def convert_pdf_to_image(file: UploadFile = File(...)) -> dict[str, Any]:
    if not file.filename or not _allowed(file.filename):
        raise HTTPException(status_code=400, detail="Invalid PDF file")
    data = await file.read()
    record = create_file_record(data, file.filename, "uploads")
    output_name = f"{Path(file.filename).stem}-converted-page"
    job_id = str(uuid.uuid4())
    result = _run_processing_task("pdf_to_image", record["path"], output_name=output_name)
    JOBS[job_id] = {"status": "completed", "operation": "pdf_to_image", "output_files": result}
    return _job_result(job_id, "pdf_to_image", result)


@app.post("/api/v1/image/to-pdf")
async def image_to_pdf_endpoint(file: UploadFile = File(...)) -> dict[str, Any]:
    if not file.filename or Path(file.filename).suffix.lower() not in {".png", ".jpg", ".jpeg"}:
        raise HTTPException(status_code=400, detail="Invalid image file")
    data = await file.read()
    record = create_file_record(data, file.filename, "uploads")
    output_name = f"{Path(file.filename).stem}-converted.pdf"
    job_id = str(uuid.uuid4())
    result = _run_processing_task("image_to_pdf", record["path"], output_name=output_name)
    JOBS[job_id] = {"status": "completed", "operation": "image_to_pdf", "output_file": result}
    return _job_result(job_id, "image_to_pdf", result)


@app.post("/api/v1/word/to-pdf")
async def word_to_pdf_endpoint(file: UploadFile = File(...)) -> dict[str, Any]:
    if not file.filename or Path(file.filename).suffix.lower() not in {".doc", ".docx"}:
        raise HTTPException(status_code=400, detail="Invalid Word file")
    data = await file.read()
    record = create_file_record(data, file.filename, "uploads")
    output_name = f"{Path(file.filename).stem}-converted.pdf"
    job_id = str(uuid.uuid4())
    result = _run_processing_task("word_to_pdf", record["path"], output_name=output_name)
    JOBS[job_id] = {"status": "completed", "operation": "word_to_pdf", "output_file": result}
    return _job_result(job_id, "word_to_pdf", result)


@app.post("/api/v1/pdf/to-text")
async def pdf_to_text_endpoint(file: UploadFile = File(...)) -> dict[str, Any]:
    if not file.filename or Path(file.filename).suffix.lower() != ".pdf":
        raise HTTPException(status_code=400, detail="Invalid PDF file")
    data = await file.read()
    record = create_file_record(data, file.filename, "uploads")
    output_name = f"{Path(file.filename).stem}-converted.txt"
    job_id = str(uuid.uuid4())
    result = _run_processing_task("pdf_to_text", record["path"], output_name=output_name)
    JOBS[job_id] = {"status": "completed", "operation": "pdf_to_text", "output_file": result}
    return _job_result(job_id, "pdf_to_text", result)


@app.get("/api/v1/jobs/{job_id}")
def get_job(job_id: str) -> dict[str, Any]:
    job = JOBS.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.get("/api/v1/jobs/{job_id}/download")
def download_job(job_id: str) -> FileResponse:
    job = JOBS.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    output_path = job.get("output_file") or (job.get("output_files") or [None])[0]
    if output_path is None:
        raise HTTPException(status_code=404, detail="No output available")
    return FileResponse(path=str(output_path), media_type="application/octet-stream", filename=Path(output_path).name)


@app.get("/api/v1/files/{file_id}/download")
def download_file(file_id: str) -> FileResponse:
    record = _find_file(file_id)
    if record is None:
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path=str(record), media_type="application/octet-stream", filename=record.name)


@app.get("/api/v1/files")
def list_files() -> dict[str, list[str]]:
    files = [p.name for p in UPLOAD_DIR.iterdir()] + [p.name for p in OUTPUT_DIR.iterdir()]
    return {"files": sorted(files)}
