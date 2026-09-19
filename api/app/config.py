import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
STORAGE_ROOT = Path(os.getenv("STORAGE_ROOT", str(BASE_DIR / "storage")))
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", str(STORAGE_ROOT / "uploads")))
OUTPUT_DIR = Path(os.getenv("OUTPUT_DIR", str(STORAGE_ROOT / "outputs")))
TMP_DIR = Path(os.getenv("TMP_DIR", str(STORAGE_ROOT / "tmp")))
FILE_RETENTION_MINUTES = int(os.getenv("FILE_RETENTION_MINUTES", "60"))
MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "50"))
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg", ".txt"}
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
