const state = {
  pdfDoc: null,
  currentPage: 1,
  zoom: 1.25,
  pageCount: 0,
  activeTool: 'select',
  textItems: [],
  pdfFile: null,
};

const emptyState = document.getElementById('emptyState');
const canvasWrap = document.getElementById('canvasWrap');
const pageIndicator = document.getElementById('pageIndicator');
const thumbList = document.getElementById('thumbList');
const canvas = document.getElementById('pdfCanvas');
const ctx = canvas.getContext('2d');
const pdfUploadInput = document.getElementById('pdfUploadInput');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');
const toolButtons = document.querySelectorAll('.tool-button');

if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

function setActiveTool(tool) {
  state.activeTool = tool;
  toolButtons.forEach((button) => button.classList.toggle('active', button.dataset.tool === tool));
}

async function renderCurrentPage() {
  if (!state.pdfDoc || !state.currentPage) {
    return;
  }

  const page = await state.pdfDoc.getPage(state.currentPage);
  const viewport = page.getViewport({ scale: state.zoom });
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: ctx, viewport }).promise;
  drawTextOverlays(page, viewport);
  pageIndicator.textContent = `Page ${state.currentPage} / ${state.pageCount}`;
}

function drawTextOverlays(page, viewport) {
  const items = state.textItems.filter((item) => item.page === state.currentPage);
  items.forEach((item) => {
    ctx.font = `${item.size || 18}px Inter, sans-serif`;
    ctx.fillStyle = item.color || '#1d4ed8';
    ctx.fillText(item.text, item.x * viewport.width, item.y * viewport.height);
  });
}

async function renderThumbs() {
  if (!state.pdfDoc) {
    thumbList.innerHTML = '';
    return;
  }

  thumbList.innerHTML = '';

  for (let pageNumber = 1; pageNumber <= state.pageCount; pageNumber += 1) {
    const page = await state.pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 0.18 });
    const wrap = document.createElement('button');
    wrap.type = 'button';
    wrap.className = 'thumb-card';
    wrap.dataset.page = String(pageNumber);
    wrap.title = `Page ${pageNumber}`;

    const canvasThumb = document.createElement('canvas');
    const thumbCtx = canvasThumb.getContext('2d');
    canvasThumb.width = viewport.width;
    canvasThumb.height = viewport.height;
    await page.render({ canvasContext: thumbCtx, viewport }).promise;

    wrap.appendChild(canvasThumb);
    const label = document.createElement('span');
    label.className = 'thumb-label';
    label.textContent = `Page ${pageNumber}`;
    wrap.appendChild(label);

    wrap.addEventListener('click', () => {
      state.currentPage = pageNumber;
      document.querySelectorAll('.thumb-card').forEach((card) => {
        card.classList.toggle('active', Number(card.dataset.page) === pageNumber);
      });
      renderCurrentPage();
    });

    if (pageNumber === state.currentPage) {
      wrap.classList.add('active');
    }

    thumbList.appendChild(wrap);
  }
}

async function handleFileSelection(file) {
  if (!file || file.type !== 'application/pdf') {
    if (file) {
      alert('Please upload a valid PDF file.');
    }
    return;
  }

  const fileBytes = await file.arrayBuffer();
  state.pdfFile = file;
  state.textItems = [];
  state.pdfDoc = await window.pdfjsLib.getDocument({ data: fileBytes }).promise;
  state.pageCount = state.pdfDoc.numPages;
  state.currentPage = 1;
  emptyState.hidden = true;
  canvasWrap.hidden = false;
  await renderThumbs();
  await renderCurrentPage();
}

pdfUploadInput.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  handleFileSelection(file);
});

prevPageBtn.addEventListener('click', async () => {
  if (!state.pdfDoc) return;
  state.currentPage = Math.max(1, state.currentPage - 1);
  await renderThumbs();
  await renderCurrentPage();
});

nextPageBtn.addEventListener('click', async () => {
  if (!state.pdfDoc) return;
  state.currentPage = Math.min(state.pageCount, state.currentPage + 1);
  await renderThumbs();
  await renderCurrentPage();
});

zoomInBtn.addEventListener('click', async () => {
  state.zoom = Math.min(2.5, Number((state.zoom + 0.2).toFixed(2)));
  await renderCurrentPage();
});

zoomOutBtn.addEventListener('click', async () => {
  state.zoom = Math.max(0.6, Number((state.zoom - 0.2).toFixed(2)));
  await renderCurrentPage();
});

toolButtons.forEach((button) => {
  button.addEventListener('click', () => setActiveTool(button.dataset.tool));
});

canvas.addEventListener('click', async (event) => {
  if (!state.pdfDoc || state.activeTool !== 'text') {
    return;
  }

  const textValue = window.prompt('Enter text to add to this page:', 'New text');
  if (!textValue) {
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const relativeX = (event.clientX - rect.left) / rect.width;
  const relativeY = (event.clientY - rect.top) / rect.height;

  state.textItems.push({
    page: state.currentPage,
    text: textValue,
    x: relativeX,
    y: relativeY,
    size: 18,
    color: '#1d4ed8',
  });

  await renderCurrentPage();
});

downloadPdfBtn.addEventListener('click', async () => {
  if (!state.pdfFile) {
    alert('Please upload a PDF before downloading.');
    return;
  }

  if (!window.PDFLib) {
    alert('PDF export library is not ready yet.');
    return;
  }

  const bytes = await state.pdfFile.arrayBuffer();
  const pdfDoc = await window.PDFLib.PDFDocument.load(bytes);

  for (const item of state.textItems) {
    const page = pdfDoc.getPage(item.page - 1);
    const { width, height } = page.getSize();
    page.drawText(item.text, {
      x: item.x * width,
      y: height - (item.y * height),
      size: item.size || 18,
      color: window.PDFLib.rgb(0.11, 0.29, 0.86),
    });
  }

  const resultBytes = await pdfDoc.save();
  const blob = new Blob([resultBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = (state.pdfFile.name || 'edited-document.pdf').replace(/\.pdf$/i, '') + '-edited.pdf';
  link.click();
  URL.revokeObjectURL(url);
});

if (!window.pdfjsLib) {
  emptyState.innerHTML = '<h1>PDF editor unavailable</h1><p>The PDF rendering library could not be loaded. Please refresh the page.</p>';
}
