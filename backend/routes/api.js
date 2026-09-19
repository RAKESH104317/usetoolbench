const express = require('express');
const multer = require('multer');
const { toolCatalog, config } = require('../config');
const { saveUpload } = require('../services/storage');
const { generateConversionResult } = require('../services/conversion');
const { enqueueJob } = require('../services/jobs');
const { validateFile } = require('../services/validation');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxFileSize },
});

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'pdfpro-api', timestamp: new Date().toISOString() });
});

router.get('/tools', (req, res) => {
  res.json({ tools: toolCatalog });
});

router.post('/convert/:tool', upload.single('file'), async (req, res) => {
  const tool = toolCatalog.find((item) => item.slug === req.params.tool);

  if (!tool) {
    return res.status(404).json({ error: 'Tool not found.' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a file.' });
  }

  const validation = validateFile(req.file, { allowedExtensions: ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'] });

  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  const uploadMeta = saveUpload(req.file, 'uploads');
  const job = enqueueJob({
    tool: tool.slug,
    originalName: uploadMeta.originalName,
    status: 'processing',
    size: uploadMeta.size,
  });

  try {
    const result = await generateConversionResult(tool.slug, uploadMeta, req.body || {});
    job.status = 'completed';
    job.result = result;

    return res.json({
      status: 'success',
      tool: tool.slug,
      message: result.message,
      jobId: job.id,
      outputFileName: result.outputFileName,
      downloadUrl: result.downloadUrl,
      size: result.size,
      fileType: result.fileType,
    });
  } catch (error) {
    job.status = 'failed';
    job.error = error.message;
    return res.status(500).json({ error: 'Conversion failed.', details: error.message });
  }
});

module.exports = { apiRouter: router };
