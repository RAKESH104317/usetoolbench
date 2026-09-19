const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { config } = require('../config');

function ensureStorageDirs() {
  const dirs = ['uploads', 'outputs', 'tmp'];
  dirs.forEach((dir) => {
    const target = path.join(config.storageRoot, dir);
    fs.mkdirSync(target, { recursive: true });
  });
}

function saveUpload(file, subdir = 'uploads') {
  ensureStorageDirs();
  const safeName = (file.originalname || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_');
  const id = uuidv4();
  const destination = path.join(config.storageRoot, subdir);
  const targetPath = path.join(destination, `${id}-${safeName}`);
  fs.writeFileSync(targetPath, file.buffer);

  return {
    id,
    originalName: safeName,
    filePath: targetPath,
    size: file.size,
    mimetype: file.mimetype,
    relativePath: path.relative(config.storageRoot, targetPath).replace(/\\/g, '/'),
  };
}

function writeBinaryOutput(fileName, data, subdir = 'outputs') {
  ensureStorageDirs();
  const destination = path.join(config.storageRoot, subdir);
  const targetPath = path.join(destination, fileName);
  fs.writeFileSync(targetPath, data);

  return {
    fileName,
    filePath: targetPath,
    relativePath: path.relative(config.storageRoot, targetPath).replace(/\\/g, '/'),
    downloadUrl: `/downloads/${subdir}/${encodeURIComponent(fileName)}`,
  };
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

module.exports = { ensureStorageDirs, saveUpload, writeBinaryOutput, readJson };
