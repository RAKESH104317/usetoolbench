require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { config, toolCatalog } = require('./backend/config');
const { apiRouter } = require('./backend/routes/api');
const { renderHomePage, renderToolPage, renderPdfEditorPage } = require('./frontend/pageRenderer');

const app = express();

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(',') }));
app.use('/downloads', express.static(config.storageRoot));
app.use('/assets', express.static(path.join(__dirname, 'frontend', 'public')));
app.use('/api/v1', apiRouter);

app.get('/', (req, res) => {
  res.send(renderHomePage());
});

app.get('/pdf-editor', (req, res) => {
  res.send(renderPdfEditorPage());
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'pdfpro', timestamp: new Date().toISOString() });
});

toolCatalog.forEach((tool) => {
  app.get(tool.path, (req, res) => {
    res.send(renderToolPage(tool));
  });
});

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`PDFPro is running at http://localhost:${config.port}`);
  });
}

module.exports = { app };
