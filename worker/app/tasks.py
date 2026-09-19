import json
import os
from celery import Celery

from api.app.config import REDIS_URL
from api.app.processor import (
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

celery = Celery("pdfpro_worker", broker=REDIS_URL, backend=REDIS_URL)


@celery.task(name="process_pdf_task")
def process_pdf_task(operation: str, source_path: str, **kwargs):
    if operation == "pdf_to_word":
        output_name = kwargs.get("output_name", "converted.docx")
        return {"status": "completed", "output_path": pdf_to_word(source_path, output_name), "operation": operation}
    if operation == "pdf_to_text":
        output_name = kwargs.get("output_name", "converted.txt")
        return {"status": "completed", "output_path": pdf_to_text(source_path, output_name), "operation": operation}
    if operation == "pdf_to_excel":
        output_name = kwargs.get("output_name", "converted.xlsx")
        return {"status": "completed", "output_path": pdf_to_excel(source_path, output_name), "operation": operation}
    if operation == "pdf_to_image":
        output_prefix = kwargs.get("output_name", "converted-page")
        return {"status": "completed", "output_paths": pdf_to_image(source_path, output_prefix), "operation": operation}
    if operation == "image_to_pdf":
        output_name = kwargs.get("output_name", "converted.pdf")
        return {"status": "completed", "output_path": image_to_pdf(source_path, output_name), "operation": operation}
    if operation == "word_to_pdf":
        output_name = kwargs.get("output_name", "converted.pdf")
        return {"status": "completed", "output_path": word_to_pdf(source_path, output_name), "operation": operation}
    if operation == "merge_pdf":
        pdf_paths = kwargs.get("pdf_paths", [])
        output_name = kwargs.get("output_name", "merged.pdf")
        return {"status": "completed", "output_path": merge_pdf(pdf_paths, output_name), "operation": operation}
    if operation == "split_pdf":
        output_prefix = kwargs.get("output_prefix", "split")
        page_ranges = kwargs.get("page_ranges")
        return {"status": "completed", "output_paths": split_pdf(source_path, output_prefix, page_ranges), "operation": operation}
    if operation == "rotate_pdf":
        output_name = kwargs.get("output_name", "rotated.pdf")
        angle = int(kwargs.get("angle", 90))
        return {"status": "completed", "output_path": rotate_pdf(source_path, output_name, angle), "operation": operation}
    if operation == "compress_pdf":
        output_name = kwargs.get("output_name", "compressed.pdf")
        return {"status": "completed", "output_path": compress_pdf(source_path, output_name), "operation": operation}
    if operation == "ocr_pdf":
        output_name = kwargs.get("output_name", "ocr.pdf")
        return {"status": "completed", "output_path": ocr_pdf(source_path, output_name), "operation": operation}
    raise ValueError(f"Unsupported operation: {operation}")
