from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from pathlib import Path
import os, uuid, sqlite3, re
from datetime import datetime, timezone

app=FastAPI(title="UseToolBench",version="2.0.0")
BASE_DIR=Path(__file__).resolve().parent
ROOT=Path(os.getenv("STORAGE_ROOT",str(BASE_DIR/"storage")))
OUT=ROOT/"outputs"; UP=ROOT/"uploads"; DB=ROOT/"jobs.db"
MAX=int(os.getenv("MAX_FILE_SIZE_MB","25"))*1024*1024
TOOLS=[("merge","Merge PDF",".pdf",True),("split","Split PDF",".pdf",False),("rotate","Rotate PDF",".pdf",False),("compress","Compress PDF",".pdf",False),("pdf-to-text","PDF to Text",".pdf",False),("pdf-to-word","PDF to Word",".pdf",False),("pdf-to-excel","PDF to Excel",".pdf",False),("pdf-to-image","PDF to Images",".pdf",False),("image-to-pdf","Image to PDF",".png,.jpg,.jpeg",True),("word-to-pdf","Word to PDF",".docx",False),("ocr","OCR PDF",".pdf",False)]

@app.on_event("startup")
def startup():
    UP.mkdir(parents=True,exist_ok=True);OUT.mkdir(parents=True,exist_ok=True)
    with sqlite3.connect(DB) as db:
        db.execute("CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY,operation TEXT,status TEXT,output TEXT,name TEXT,created TEXT,error TEXT)")
        db.commit()

@app.get("/health")
def health(): return {"status":"ok","service":"usetoolbench","version":"2.0.0"}

@app.get("/api/tools")
def tools(): return {"tools":[{"id":a,"name":b,"accept":c,"multiple":d} for a,b,c,d in TOOLS],"max_file_size_mb":MAX//1024//1024}

def safe_name(name): return re.sub(r"[^A-Za-z0-9._-]+","-",Path(name).stem).strip(".-")[:70] or "document"

@app.get("/",response_class=HTMLResponse)
def home(): return (BASE_DIR/"frontend"/"index.html").read_text(encoding="utf-8")
