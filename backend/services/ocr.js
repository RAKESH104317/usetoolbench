const { config } = require('../config');

function detectOcrLanguages() {
  return config.ocrLanguages;
}

function performOcr(fileName, text) {
  const languages = detectOcrLanguages();
  return {
    fileName,
    languages,
    status: 'completed',
    confidence: 0.98,
    extractedText: text || 'OCR text preview generated from uploaded document.',
    provider: config.ocrProvider,
  };
}

module.exports = { detectOcrLanguages, performOcr };
