import os
import shutil
import uuid
from datetime import datetime, timedelta
from pathlib import Path

from .config import FILE_RETENTION_MINUTES, OUTPUT_DIR, TMP_DIR, UPLOAD_DIR


def ensure_directories() -> None:
    for directory in [UPLOAD_DIR, OUTPUT_DIR, TMP_DIR]:
        directory.mkdir(parents=True, exist_ok=True)


def safe_name(filename: str) -> str:
    name = os.path.basename(filename)
    return name.replace("/", "_").replace("\\", "_")


def create_file_record(file: bytes, filename: str, subdir: str = "uploads") -> dict:
    ensure_directories()
    destination = UPLOAD_DIR if subdir == "uploads" else OUTPUT_DIR
    dest = destination / f"{uuid.uuid4()}-{safe_name(filename)}"
    dest.write_bytes(file)
    return {
        "file_id": dest.stem.split("-")[0],
        "filename": safe_name(filename),
        "path": str(dest),
        "size": dest.stat().st_size,
        "uploaded_at": datetime.utcnow().isoformat(),
    }


def cleanup_expired_files() -> int:
    ensure_directories()
    cutoff = datetime.utcnow() - timedelta(minutes=FILE_RETENTION_MINUTES)
    removed = 0
    for directory in [UPLOAD_DIR, OUTPUT_DIR, TMP_DIR]:
        for path in directory.iterdir():
            if path.is_file():
                try:
                    timestamp = datetime.fromtimestamp(path.stat().st_mtime)
                    if timestamp < cutoff:
                        path.unlink()
                        removed += 1
                except Exception:
                    continue
    return removed


def delete_file(path: str) -> bool:
    p = Path(path)
    if p.exists():
        p.unlink()
        return True
    return False


def write_output(file_name: str, bytes_data: bytes) -> dict:
    ensure_directories()
    dest = OUTPUT_DIR / safe_name(file_name)
    dest.write_bytes(bytes_data)
    return {
        "filename": safe_name(file_name),
        "path": str(dest),
        "download_url": f"/api/v1/jobs/{dest.stem}/download",
        "size": dest.stat().st_size,
    }
