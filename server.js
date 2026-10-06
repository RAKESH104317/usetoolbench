const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs/promises");
const crypto = require("crypto");
const { PDFDocument, degrees } = require("pdf-lib");
const sharp = require("sharp");

const app = express();
const PORT = Number(process.env.PORT || 10000);
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const RETENTION_MS = 60 * 60 * 1000;
const ROOT = path.join(process.cwd(), "storage");
const UPLOADS = path.join(ROOT, "uploads");
const OUTPUTS = path.join(ROOT, "outputs");

const jobs = new Map();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 20 }
});

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(process.cwd(), "public")));

function id() { return crypto.randomUUID(); }
function safeName(name, fallback = "document") {
  const base = path.basename(name || fallback).replace(/[^a-zA-Z0-9._-]/g, "_");
  return base.slice(0, 120) || fallback;
}
function ext(name) { return path.extname(name || "").toLowerCase(); }
function requireExt(file, allowed) {
  if (!file || !allowed.includes(ext(file.originalname))) {
    const e = new Error("Unsupported file type.");
    e.status = 400; throw e;
  }
}
function outputPath(jobId, filename) {
  return path.join(OUTPUTS, jobId, safeName(filename));
}
async function ensureDirs() {
  await fs.mkdir(UPLOADS, { recursive: true });
  await fs.mkdir(OUTPUTS, { recursive: true });
}
async function saveOutput(jobId, filename, buffer) {
  const dir = path.join(OUTPUTS, jobId);
  await fs.mkdir(dir, { recursive: true });
  const clean = safeName(filename);
  const target = outputPath(jobId, clean);
  await fs.writeFile(target, buffer);
  return { filename: clean, path: target, size: buffer.length };
}
function finish(jobId, data) {
  const job = jobs.get(jobId);
  if (job) Object.assign(job, data, { status: "completed", completedAt: Date.now() });
}
function fail(jobId, error) {
  const job = jobs.get(jobId);
  if (job) Object.assign(job, { status: "failed", error: error.message });
}

app.get("/health", (req, res) => res.json({ status: "ok", version: "2.0.0" }));

app.post("/api/jobs", upload.array("files", 20), async (req, res) => {
  const tool = String(req.body.tool || "");
  const files = req.files || [];
  const allowed = {
    merge: [".pdf"], split: [".pdf"], rotate: [".pdf"], compress: [".pdf"],
    "image-to-pdf": [".jpg", ".jpeg", ".png", ".webp"]
  };
  if (!allowed[tool]) return res.status(400).json({ error: "Unknown tool." });
  if (!files.length) return res.status(400).json({ error: "Upload at least one file." });
  if (tool === "merge" && files.length < 2) return res.status(400).json({ error: "Merge requires at least two PDFs." });
  for (const file of files) {
    try { requireExt(file, allowed[tool]); } catch (e) { return res.status(e.status || 400).json({ error: e.message }); }
  }

  const jobId = id();
  jobs.set(jobId, { status: "processing", createdAt: Date.now(), tool });
  res.status(202).json({ jobId, status: "processing" });

  try {
    let result;
    if (tool === "merge") {
      const out = await PDFDocument.create();
      for (const file of files) {
        const src = await PDFDocument.load(file.buffer, { ignoreEncryption: false });
        const pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach(p => out.addPage(p));
      }
      result = await saveOutput(jobId, "merged.pdf", Buffer.from(await out.save()));
    } else if (tool === "split") {
      const src = await PDFDocument.load(files[0].buffer);
      const page = Number(req.body.page);
      if (!Number.isInteger(page) || page < 1 || page > src.getPageCount()) throw new Error("Enter a valid page number.");
      const out = await PDFDocument.create();
      const [copied] = await out.copyPages(src, [page - 1]);
      out.addPage(copied);
      result = await saveOutput(jobId, "split-page.pdf", Buffer.from(await out.save()));
    } else if (tool === "rotate") {
      const angle = Number(req.body.angle || 90);
      if (![90, 180, 270].includes(angle)) throw new Error("Rotation must be 90, 180, or 270 degrees.");
      const doc = await PDFDocument.load(files[0].buffer);
      doc.getPages().forEach(p => p.setRotation(degrees((p.getRotation().angle + angle) % 360)));
      result = await saveOutput(jobId, "rotated.pdf", Buffer.from(await doc.save()));
    } else if (tool === "compress") {
      const doc = await PDFDocument.load(files[0].buffer);
      result = await saveOutput(jobId, "compressed.pdf", Buffer.from(await doc.save({ useObjectStreams: true, addDefaultPage: false })));
    } else if (tool === "image-to-pdf") {
      const out = await PDFDocument.create();
      for (const file of files) {
        const meta = await sharp(file.buffer).metadata();
        const imageBuffer = await sharp(file.buffer).jpeg({ quality: 92 }).toBuffer();
        const image = await out.embedJpg(imageBuffer);
        const width = Number(meta.width || 1200);
        const height = Number(meta.height || 1600);
        const page = out.addPage([width, height]);
        page.drawImage(image, { x: 0, y: 0, width, height });
      }
      result = await saveOutput(jobId, "images.pdf", Buffer.from(await out.save()));
    }
    finish(jobId, { result });
  } catch (error) {
    fail(jobId, error);
  }
});

app.get("/api/jobs/:jobId", (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Job expired or not found." });
  res.json({
    jobId: req.params.jobId,
    status: job.status,
    tool: job.tool,
    error: job.error || null,
    downloadUrl: job.result ? "/api/jobs/" + req.params.jobId + "/download" : null
  });
});

app.get("/api/jobs/:jobId/download", async (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job || job.status !== "completed" || !job.result?.path) return res.status(404).json({ error: "File expired or not found." });
  try {
    await fs.access(job.result.path);
    res.download(job.result.path, job.result.filename);
  } catch {
    res.status(404).json({ error: "File expired or not found." });
  }
});

setInterval(async () => {
  const cutoff = Date.now() - RETENTION_MS;
  for (const [jobId, job] of jobs) {
    if (job.createdAt < cutoff) {
      jobs.delete(jobId);
      await fs.rm(path.join(OUTPUTS, jobId), { recursive: true, force: true }).catch(() => {});
    }
  }
}, 10 * 60 * 1000).unref();

ensureDirs().then(() => {
  app.listen(PORT, "0.0.0.0", () => console.log("UseToolBench listening on " + PORT));
}).catch(err => { console.error(err); process.exit(1); });
