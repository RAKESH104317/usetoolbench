const path = require('path');
const { config } = require('../config');

const allowedMimeTypes = {
  pdf: ['application/pdf'],
  doc: ['application/msword', 'application/vnd.ms-word', 'application/octet-stream'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  excel: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  image: ['image/jpeg', 'image/png', 'image/webp'],
};

function sanitizeFilename(filename = 'document') {
  return path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
}

function getExtension(filename) {
  return path.extname(filename || '').toLowerCase();
}

function validateFile(file, { allowedExtensions = [] } = {}) {
  if (!file) {
    return { valid: false, error: 'No file uploaded.' };
  }

  const ext = getExtension(file.originalname);
  if (allowedExtensions.length > 0 && !allowedExtensions.includes(ext)) {
    return { valid: false, error: `Only ${allowedExtensions.join(', ')} files are supported.` };
  }

  if (file.size > config.maxFileSize) {
    return { valid: false, error: 'File is too large for the current plan.' };
  }

  return { valid: true };
}

function validatePdf(file) {
  const ext = getExtension(file.originalname);
  const mime = file.mimetype || '';
  const valid = ext === '.pdf' || mime.includes('pdf');

  if (!valid) {
    return { valid: false, error: 'Only PDF files are supported for this tool.' };
  }

  return { valid: true };
}

module.exports = { sanitizeFilename, getExtension, validateFile, validatePdf, allowedMimeTypes };
