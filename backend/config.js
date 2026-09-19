const path = require('path');

const config = {
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:3000/api/v1',
  port: Number(process.env.PORT || 3000),
  maxFileSize: parseSize(process.env.MAX_FILE_SIZE || '25MB'),
  maxPages: Number(process.env.MAX_PAGES || 500),
  retentionMinutes: Number(process.env.FILE_RETENTION_MINUTES || 120),
  storageProvider: process.env.STORAGE_PROVIDER || 'local',
  storageRoot: path.resolve(process.cwd(), process.env.STORAGE_ROOT || 'storage'),
  ocrProvider: process.env.OCR_PROVIDER || 'tesseract',
  ocrLanguages: (process.env.OCR_LANGUAGES || 'en,hi').split(',').map((v) => v.trim()).filter(Boolean),
  rateLimit: Number(process.env.RATE_LIMIT || 100),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  jwtSecret: process.env.JWT_SECRET || 'development-secret-change-me',
};

function parseSize(value) {
  if (typeof value === 'number') return value;
  const match = /^([0-9]+)([kmg]?)$/i.exec(String(value).trim());
  if (!match) return 25 * 1024 * 1024;
  const number = Number(match[1]);
  const unit = (match[2] || '').toLowerCase();
  const units = { '': 1, k: 1024, m: 1024 * 1024, g: 1024 * 1024 * 1024 };
  return number * (units[unit] || 1);
}

const toolCatalog = [
  { slug: 'pdf-to-word', label: 'PDF to Word', path: '/pdf-to-word', title: 'PDF to Word Converter Online | PDFPro', description: 'Convert PDF to editable Word documents online with OCR support for scanned files.', category: 'conversion' },
  { slug: 'word-to-pdf', label: 'Word to PDF', path: '/word-to-pdf', title: 'Word to PDF Converter | PDFPro', description: 'Convert DOC and DOCX files to high-quality PDF documents in seconds.', category: 'conversion' },
  { slug: 'pdf-to-excel', label: 'PDF to Excel', path: '/pdf-to-excel', title: 'PDF to Excel Converter | PDFPro', description: 'Convert PDF tables and content into spreadsheet-friendly Excel files.', category: 'conversion' },
  { slug: 'pdf-to-jpg', label: 'PDF to JPG', path: '/pdf-to-jpg', title: 'PDF to JPG Converter | PDFPro', description: 'Turn PDF pages into JPG images with adjustable quality and page selection.', category: 'conversion' },
  { slug: 'pdf-to-png', label: 'PDF to PNG', path: '/pdf-to-png', title: 'PDF to PNG Converter | PDFPro', description: 'Convert PDF pages to PNG images for sharing, previews, or document workflows.', category: 'conversion' },
  { slug: 'jpg-to-pdf', label: 'JPG to PDF', path: '/jpg-to-pdf', title: 'JPG to PDF Converter | PDFPro', description: 'Turn JPG images into a single PDF file quickly and securely.', category: 'conversion' },
  { slug: 'png-to-pdf', label: 'PNG to PDF', path: '/png-to-pdf', title: 'PNG to PDF Converter | PDFPro', description: 'Convert PNG images into professional PDF documents in a few steps.', category: 'conversion' },
  { slug: 'merge-pdf', label: 'Merge PDF', path: '/merge-pdf', title: 'Merge PDF Files | PDFPro', description: 'Combine multiple PDF files in your preferred order with a simple drag-and-drop workflow.', category: 'tools' },
  { slug: 'split-pdf', label: 'Split PDF', path: '/split-pdf', title: 'Split PDF Files | PDFPro', description: 'Extract selected pages or split PDFs page-by-page into new documents.', category: 'tools' },
  { slug: 'compress-pdf', label: 'Compress PDF', path: '/compress-pdf', title: 'Compress PDF Files | PDFPro', description: 'Reduce the size of PDF files while keeping them usable for sharing and storage.', category: 'tools' },
  { slug: 'edit-pdf', label: 'Edit PDF', path: '/edit-pdf', title: 'Edit PDF Online | PDFPro', description: 'Add text, comments, signatures, and annotations to PDF documents in a browser.', category: 'tools' },
  { slug: 'rotate-pdf', label: 'Rotate PDF', path: '/rotate-pdf', title: 'Rotate PDF Pages | PDFPro', description: 'Rotate PDF pages left or right in bulk with instant download.', category: 'tools' },
  { slug: 'pdf-to-text', label: 'PDF to Text', path: '/pdf-to-text', title: 'PDF to Text Converter | PDFPro', description: 'Extract text from PDF files and convert it into plain text or editable output.', category: 'conversion' },
  { slug: 'ocr-pdf', label: 'OCR PDF', path: '/ocr-pdf', title: 'OCR PDF Online | PDFPro', description: 'Make scanned PDFs searchable and editable with OCR support for multiple languages.', category: 'ocr' },
];

module.exports = { config, toolCatalog };
