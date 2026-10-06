from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from pathlib import Path
import os

app = FastAPI(title="UseToolBench", version="2.0.0")
BASE_DIR = Path(__file__).resolve().parent

@app.get("/health")
def health():
    return {"status":"ok","service":"usetoolbench","version":"2.0.0"}

@app.get("/api/tools")
def tools():
    return {"tools":[
        {"id":"merge","name":"Merge PDF","accept":".pdf","multiple":True},
        {"id":"split","name":"Split PDF","accept":".pdf","multiple":False},
        {"id":"rotate","name":"Rotate PDF","accept":".pdf","multiple":False},
        {"id":"compress","name":"Compress PDF","accept":".pdf","multiple":False},
        {"id":"pdf-to-text","name":"PDF to Text","accept":".pdf","multiple":False},
        {"id":"pdf-to-word","name":"PDF to Word","accept":".pdf","multiple":False},
        {"id":"pdf-to-excel","name":"PDF to Excel","accept":".pdf","multiple":False},
        {"id":"pdf-to-image","name":"PDF to Images","accept":".pdf","multiple":False},
        {"id":"image-to-pdf","name":"Image to PDF","accept":".png,.jpg,.jpeg","multiple":True},
        {"id":"word-to-pdf","name":"Word to PDF","accept":".docx","multiple":False},
        {"id":"ocr","name":"OCR PDF","accept":".pdf","multiple":False}
    ]}

@app.get("/", response_class=HTMLResponse)
def home():
    return (BASE_DIR/"frontend"/"index.html").read_text(encoding="utf-8")
