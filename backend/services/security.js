function sanitizeInput(value = '') {
  return String(value).replace(/[<>]/g, '');
}

function cleanupExpiredFiles(fileList = []) {
  return fileList.map((file) => ({
    ...file,
    cleaned: true,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  }));
}

module.exports = { sanitizeInput, cleanupExpiredFiles };
