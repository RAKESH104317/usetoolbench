const { toolCatalog } = require('../backend/config');

function renderLayout({ title, description, body, current }) {
  const tools = toolCatalog.map((tool) => `
    <a class="tool-link ${current === tool.slug ? 'active' : ''}" href="${tool.path}">${tool.label}</a>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/assets/styles.css" />
  </head>
  <body class="tool-page-body">
    <header class="topbar">
      <div class="container topbar-inner">
        <a href="/" class="brand-wrap">
          <span class="brand-mark">P</span>
          <span>PDFPro</span>
        </a>
        <nav class="tool-nav" aria-label="PDF tools navigation">
          ${tools}
        </nav>
      </div>
    </header>
    <main class="page-shell">
      ${body}
    </main>
    <script src="/assets/script.js"></script>
  </body>
</html>`;
}

function renderHomePage() {
  const cards = toolCatalog.map((tool) => `
    <article class="home-card">
      <span class="badge">${tool.category}</span>
      <h3>${tool.label}</h3>
      <p>${tool.description}</p>
      <a href="${tool.path}">Try now</a>
    </article>
  `).join('');

  return renderLayout({
    title: 'PDFPro | PDF tools, OCR, and document conversion',
    description: 'Convert PDF files, extract text, edit documents, and power real document workflows with PDFPro.',
    current: 'home',
    body: `
      <section class="hero-section container">
        <div class="hero-copy">
          <span class="eyebrow">Built for conversion + OCR workflows</span>
          <h1>All the tools your team needs to process documents faster.</h1>
          <p>Convert PDFs, extract text, merge pages, and process scanned files from one secure cloud-ready workspace.</p>
          <div class="hero-actions">
            <a href="${toolCatalog[0].path}" class="primary-btn">Start converting</a>
            <a href="#tool-grid" class="secondary-btn">Browse tools</a>
          </div>
          <ul class="stats">
            <li><strong>1.2M+</strong><span>files processed</span></li>
            <li><strong>98%</strong><span>accuracy with OCR</span></li>
            <li><strong>24/7</strong><span>document workflows</span></li>
          </ul>
        </div>
        <div class="hero-panel">
          <div class="panel-card">
            <div class="panel-head"><span></span><span></span><span></span></div>
            <div class="panel-body">
              <div class="panel-metric">
                <small>Conversion queue</small>
                <strong>2,482 files</strong>
              </div>
              <div class="mini-bars">
                <span style="height: 30%"></span>
                <span style="height: 50%"></span>
                <span style="height: 65%"></span>
                <span style="height: 85%"></span>
                <span style="height: 100%"></span>
              </div>
              <div class="metric-row">
                <span>OCR success</span>
                <strong>98.4%</strong>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="tool-grid" class="container tools-showcase">
        <div class="section-heading">
          <span class="eyebrow">Popular tools</span>
          <h2>Fast, secure, and easy to use.</h2>
        </div>
        <div class="home-grid">${cards}</div>
      </section>
    `,
  });
}

function renderToolPage(tool) {
  const title = tool.title;
  const description = tool.description;

  return renderLayout({
    title,
    description,
    current: tool.slug,
    body: `
      <section class="container tool-view">
        <div class="tool-hero">
          <span class="eyebrow">${tool.category}</span>
          <h1>${tool.label}</h1>
          <p>${tool.description}</p>
        </div>

        <div class="tool-layout">
          <div class="tool-form-wrap">
            <form class="tool-form" data-tool="${tool.slug}" enctype="multipart/form-data">
              <label class="file-label">
                <span>Select file</span>
                <input type="file" name="file" required />
              </label>
              <button type="submit" class="primary-btn">Convert file</button>
            </form>
            <div class="status-box" aria-live="polite">
              <p>Upload a file to start a conversion job.</p>
            </div>
          </div>

          <aside class="info-panel">
            <h3>Why teams use PDFPro</h3>
            <ul>
              <li>Secure uploads and temporary file cleanup</li>
              <li>Fast conversion workflows with job tracking</li>
              <li>OCR support for scanned documents and multilingual files</li>
              <li>Cloud-ready API for integration with internal systems</li>
            </ul>
          </aside>
        </div>
      </section>
    `,
  });
}

function renderPdfEditorPage() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PDF Editor | PDFPro</title>
    <meta name="description" content="Upload a PDF, edit text, annotate it, and export a new document in the browser." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/assets/pdf-editor.css" />
  </head>
  <body class="pdf-editor-page">
    <header class="editor-header">
      <div class="editor-brand-wrap">
        <a href="/" class="editor-brand">
          <span class="brand-mark">P</span>
          <span>PDFPro</span>
        </a>
      </div>
      <div class="editor-header-actions">
        <button id="prevPageBtn" type="button" class="editor-tool-btn">Previous</button>
        <span id="pageIndicator">Page 0 / 0</span>
        <button id="nextPageBtn" type="button" class="editor-tool-btn">Next</button>
        <button id="zoomOutBtn" type="button" class="editor-tool-btn">-</button>
        <button id="zoomInBtn" type="button" class="editor-tool-btn">+</button>
        <button id="downloadPdfBtn" type="button" class="primary-btn">Download PDF</button>
      </div>
    </header>

    <main class="editor-shell">
      <aside class="editor-sidebar">
        <div class="upload-box">
          <label class="upload-trigger" for="pdfUploadInput">Upload a PDF</label>
          <input id="pdfUploadInput" type="file" accept="application/pdf" />
        </div>

        <div class="tool-panel">
          <h3>Tools</h3>
          <div class="tool-list">
            <button data-tool="select" class="tool-button active" type="button">Select</button>
            <button data-tool="text" class="tool-button" type="button">Add Text</button>
            <button data-tool="highlight" class="tool-button" type="button">Highlight</button>
            <button data-tool="draw" class="tool-button" type="button">Draw</button>
          </div>
        </div>

        <div class="page-thumbs-panel">
          <h3>Pages</h3>
          <div id="thumbList" class="thumb-list"></div>
        </div>
      </aside>

      <section class="editor-canvas-panel">
        <div class="canvas-empty" id="emptyState">
          <h1>Edit PDF Online</h1>
          <p>Upload a PDF to start editing.</p>
        </div>
        <div class="canvas-wrap" id="canvasWrap" hidden>
          <canvas id="pdfCanvas"></canvas>
        </div>
      </section>
    </main>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <script src="/assets/pdf-editor.js"></script>
  </body>
</html>`;
}

module.exports = { renderHomePage, renderToolPage, renderPdfEditorPage };
