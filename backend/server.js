require('./server.env');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const { extractTextFromDocx } = require('./extractors/docxExtractor');
const { extractTextFromPdf } = require('./extractors/pdfExtractor');
const { extractTextFromImage } = require('./extractors/imageExtractor');
const { extractLegalData } = require('./ai/claudeExtractor');
const { generateLegalReport } = require('./generators/reportGenerator');

const app = express();
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// In production serve the built React app
if (IS_PRODUCTION) {
  const publicDir = path.join(__dirname, 'public');
  if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
  }
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const UPLOADS_DIR = path.join(__dirname, 'uploads');
const REPORTS_DIR = path.join(__dirname, 'reports');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.doc', '.jpg', '.jpeg', '.png', '.tiff', '.tif', '.bmp', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${ext}`));
    }
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Legal Ops AI System is running' });
});

// Upload and extract text from documents
app.post('/api/extract', upload.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const extractionResults = [];

    for (const file of req.files) {
      const ext = path.extname(file.originalname).toLowerCase();
      let text = '';
      let method = '';

      try {
        if (ext === '.docx' || ext === '.doc') {
          text = await extractTextFromDocx(file.path);
          method = 'DOCX Parser';
        } else if (ext === '.pdf') {
          text = await extractTextFromPdf(file.path);
          method = 'PDF Parser';
        } else if (['.jpg', '.jpeg', '.png', '.tiff', '.tif', '.bmp', '.gif', '.webp'].includes(ext)) {
          text = await extractTextFromImage(file.path);
          method = 'OCR (Tesseract + Indian Languages)';
        }

        extractionResults.push({
          filename: file.originalname,
          storedAs: file.filename,   // ← always returned so analyze can Vision-read the file
          method,
          text,
          charCount: text.length
        });
      } catch (err) {
        extractionResults.push({
          filename: file.originalname,
          storedAs: file.filename,
          method: 'Failed',
          text: '',
          error: err.message
        });
      }
    }

    res.json({ success: true, files: extractionResults });
  } catch (error) {
    console.error('Extraction error:', error);
    res.status(500).json({ error: error.message });
  }
});

// AI-powered extraction of structured legal data
// Now uses Claude Vision on the actual stored files for verbatim content extraction
app.post('/api/analyze', async (req, res) => {
  try {
    const {
      texts,
      fileRefs,          // NEW: [{storedAs, originalname}] — references to uploaded files
      reportType = 'APF',
      bankName = 'Axis Bank Limited',
      firmName = 'M/s. Aneesh Associates Private Limited'
    } = req.body;

    if ((!texts || texts.length === 0) && (!fileRefs || fileRefs.length === 0)) {
      return res.status(400).json({ error: 'No documents provided for analysis' });
    }

    // Build combined pre-extracted text (fallback / supplementary)
    const combinedText = (texts || [])
      .map((t, i) => `--- Document ${i + 1}: ${t.filename} ---\n${t.text || '(scanned — see Vision extraction)'}`)
      .join('\n\n');

    // Build file objects with actual disk paths for Vision extraction
    const fileObjects = (fileRefs || []).map(ref => ({
      path: path.join(UPLOADS_DIR, ref.storedAs),
      originalname: ref.originalname,
      filename: ref.storedAs,
    })).filter(f => fs.existsSync(f.path));

    // If no explicit fileRefs, reconstruct from texts array storedAs fields
    const fallbackFiles = fileObjects.length === 0
      ? (texts || []).filter(t => t.storedAs).map(t => ({
          path: path.join(UPLOADS_DIR, t.storedAs),
          originalname: t.filename,
          filename: t.storedAs,
        })).filter(f => fs.existsSync(f.path))
      : [];

    const allFiles = [...fileObjects, ...fallbackFiles];
    console.log(`Analyzing ${allFiles.length} files with Claude Vision + ${combinedText.length} chars pre-extracted text`);

    const structuredData = await extractLegalData(combinedText, reportType, bankName, firmName, allFiles);

    res.json({ success: true, data: structuredData });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate DOCX report from structured data
app.post('/api/generate-report', async (req, res) => {
  try {
    const { data, firmName, advocateName } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'No data provided' });
    }

    const reportId = uuidv4();
    const reportPath = path.join(REPORTS_DIR, `Legal_Scrutiny_Report_${reportId}.docx`);

    await generateLegalReport(data, reportPath, firmName, advocateName);

    res.json({
      success: true,
      reportId,
      downloadUrl: `/api/download-report/${reportId}`
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download generated report
app.get('/api/download-report/:reportId', (req, res) => {
  const reportPath = path.join(REPORTS_DIR, `Legal_Scrutiny_Report_${req.params.reportId}.docx`);
  if (!fs.existsSync(reportPath)) {
    return res.status(404).json({ error: 'Report not found' });
  }
  res.download(reportPath, 'Legal_Scrutiny_Report.docx');
});

// Cleanup uploaded files
app.delete('/api/cleanup/:filename', (req, res) => {
  const filePath = path.join(UPLOADS_DIR, req.params.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  res.json({ success: true });
});

// In production, serve React app for all non-API routes
if (IS_PRODUCTION) {
  const publicDir = path.join(__dirname, 'public');
  app.get('*', (req, res) => {
    const indexPath = path.join(publicDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Frontend not built. Run: npm run build');
    }
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Legal Ops AI ${IS_PRODUCTION ? 'Production' : 'Dev'} Server running on http://localhost:${PORT}`);
});
