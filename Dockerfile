FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libreoffice \
    poppler-utils \
    imagemagick \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY api/requirements.txt /tmp/api-requirements.txt
COPY worker/requirements.txt /tmp/worker-requirements.txt
RUN pip install --upgrade pip && \
    pip install -r /tmp/api-requirements.txt && \
    pip install -r /tmp/worker-requirements.txt

FROM base AS api
WORKDIR /app
COPY api /app/api
COPY worker /app/worker
COPY storage /app/storage
EXPOSE 8000

FROM base AS worker
WORKDIR /app
COPY worker /app/worker
COPY api /app/api
COPY storage /app/storage
