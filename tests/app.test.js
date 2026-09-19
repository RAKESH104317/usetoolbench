const test = require('node:test');
const assert = require('node:assert/strict');

const { config, toolCatalog } = require('../backend/config');
const { validateFile } = require('../backend/services/validation');

test('config exposes default app settings', () => {
  assert.equal(typeof config.port, 'number');
  assert.ok(config.port > 0);
});

test('tool catalog contains PDF tools', () => {
  assert.ok(toolCatalog.length > 10);
  assert.ok(toolCatalog.some((tool) => tool.slug === 'pdf-to-word'));
  assert.ok(toolCatalog.some((tool) => tool.slug === 'ocr-pdf'));
});

test('validation rejects empty files and supports allowed extensions', () => {
  const invalid = validateFile(null, { allowedExtensions: ['.pdf'] });
  assert.equal(invalid.valid, false);

  const valid = validateFile({ originalname: 'sample.pdf', size: 1024, mimetype: 'application/pdf' }, { allowedExtensions: ['.pdf'] });
  assert.equal(valid.valid, true);
});
