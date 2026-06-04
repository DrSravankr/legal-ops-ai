require('./server.env');
const express = require('express');
const cors    = require('cors');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const os      = require('os');
const { v4: uuidv4 } = require('uuid');

const { extractTextFromDocx } = require('./extractors/docxExtractor');
const { extractTextFromPdf }  = require('./extractors/pdfExtractor');
const { extractTextFromImage }= require('./extractors/imageExtractor');
const { extractLegalData }    = require('./ai/claudeExtractor');
const { generateLegalReport } = require('./generators/reportGenerator');

const app = express();
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// ── Static files ──────────────────────────────────────────────────────────────
if (IS_PRODUCTION) {
  const publicDir = path.join(__dirname, 'public');
  if (fs.existsSync(publicDir)) app.use(express.static(publicDir));
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ── Use /tmp for uploads on Render (persistent within session) ────────────────
const UPLOADS_DIR = process.env.NODE_ENV === 'production'
  ? path.join(os.tmpdir(), 'legal-ops-uploads')
  : path.join(__dirname, 'uploads');
const REPORTS_DIR = process.env.NODE_ENV === 'production'
  ? path.join(os.tmpdir(), 'legal-ops-reports')
  : path.join(__dirname, 'reports');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

// ── Simple user store (JSON file) ─────────────────────────────────────────────
const USERS_FILE = path.join(os.tmpdir(), 'legal-ops-users.json');

function getUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch(e) {}
  // Default admin user
  const defaults = [
    { id:'admin1', firstName:'Admin', lastName:'User', email:'admin@aneeshassociates.in',
      password:'Admin@2026', org:'Aneesh Associates', role:'admin', status:'approved',
      created: new Date().toISOString() }
  ];
  fs.writeFileSync(USERS_FILE, JSON.stringify(defaults, null, 2));
  return defaults;
}
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// ── Auth endpoints ─────────────────────────────────────────────────────────────

// Register
app.post('/api/auth/register', (req, res) => {
  const { firstName, lastName, email, password, org, mobile } = req.body;
  if (!firstName || !lastName || !email || !password)
    return res.status(400).json({ error: 'All fields are required' });

  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
    return res.status(409).json({ error: 'Email already registered. Please sign in.' });

  const newUser = {
    id: uuidv4(), firstName, lastName,
    email: email.toLowerCase(), password, org: org||'', mobile: mobile||'',
    role: 'client', status: 'pending', created: new Date().toISOString()
  };
  users.push(newUser);
  saveUsers(users);

  const { password: _, ...safeUser } = newUser;
  res.json({ success: true, user: safeUser, message: 'Registration submitted. Awaiting admin approval.' });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  if (user.status === 'pending')
    return res.status(403).json({ error: 'pending', message: 'Your account is awaiting admin approval.' });
  if (user.status === 'rejected')
    return res.status(403).json({ error: 'rejected', message: 'Your access request was not approved.' });

  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

// Get all users (admin)
app.get('/api/auth/users', (req, res) => {
  const users = getUsers().map(({ password: _, ...u }) => u);
  res.json({ success: true, users });
});

// Approve / reject user (admin)
app.patch('/api/auth/users/:id', (req, res) => {
  const { status } = req.body;
  const users = getUsers();
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.status = status;
  saveUsers(users);
  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

// ── Multer (disk storage in tmp) ──────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename:    (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB — supports large ZIPs
  // Accept ALL file types — no filter
});

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Legal Ops AI System is running',
    uploadDir: UPLOADS_DIR, reportsDir: REPORTS_DIR });
});

// ── Extract ───────────────────────────────────────────────────────────────────
app.post('/api/extract', upload.array('files', 50), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ error: 'No files uploaded' });

    const LEGAL_EXTS = ['.pdf','.docx','.doc','.jpg','.jpeg','.png','.tiff','.tif','.bmp','.gif','.webp'];
    const results = [];

    for (const file of req.files) {
      const ext = path.extname(file.originalname).toLowerCase();

      // ── ZIP: extract contents and process each file inside ────────────────
      if (ext === '.zip') {
        try {
          const JSZip = require('jszip');
          const zipData = fs.readFileSync(file.path);
          const zip = await JSZip.loadAsync(zipData);
          const entries = [];
          zip.forEach((relPath, entry) => {
            if (!entry.dir && !relPath.includes('__MACOSX')) entries.push({ relPath, entry });
          });
          for (const { relPath, entry } of entries) {
            const fileExt = path.extname(relPath).toLowerCase();
            if (!LEGAL_EXTS.includes(fileExt)) continue;
            const fileName = path.basename(relPath);
            const savedName = uuidv4() + fileExt;
            const savedPath = path.join(UPLOADS_DIR, savedName);
            const content = await entry.async('nodebuffer');
            fs.writeFileSync(savedPath, content);
            let text = '', method = '';
            try {
              if (['.docx','.doc'].includes(fileExt)) { text = await extractTextFromDocx(savedPath); method = 'DOCX'; }
              else if (fileExt === '.pdf')             { text = await extractTextFromPdf(savedPath);  method = 'PDF'; }
              else                                     { text = await extractTextFromImage(savedPath);method = 'OCR'; }
            } catch(e2) { /* text stays empty */ }
            results.push({ filename: fileName, storedAs: savedName, method: `ZIP → ${method}`, text, charCount: text.length });
          }
          fs.unlinkSync(file.path); // remove the ZIP itself after extraction
        } catch(zipErr) {
          results.push({ filename: file.originalname, storedAs: file.filename, method: 'ZIP Failed', text: '', error: zipErr.message });
        }
        continue;
      }

      // ── Regular file ──────────────────────────────────────────────────────
      let text = '', method = '';
      try {
        if (['.docx','.doc'].includes(ext))  { text = await extractTextFromDocx(file.path); method = 'DOCX'; }
        else if (ext === '.pdf')              { text = await extractTextFromPdf(file.path);  method = 'PDF'; }
        else if (LEGAL_EXTS.includes(ext))   { text = await extractTextFromImage(file.path);method = 'OCR'; }
        else                                 { method = 'Skipped (unsupported type)'; }
        results.push({ filename: file.originalname, storedAs: file.filename, method, text, charCount: text.length });
      } catch(err) {
        results.push({ filename: file.originalname, storedAs: file.filename, method: 'Failed', text: '', error: err.message });
      }
    }
    res.json({ success: true, files: results });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── Analyze ───────────────────────────────────────────────────────────────────
app.post('/api/analyze', async (req, res) => {
  try {
    const { texts, fileRefs, reportType='APF',
            bankName='Axis Bank Limited',
            firmName='M/s. Aneesh Associates Private Limited' } = req.body;

    if ((!texts||!texts.length) && (!fileRefs||!fileRefs.length))
      return res.status(400).json({ error: 'No documents provided' });

    const combinedText = (texts||[]).map((t,i) =>
      `--- Document ${i+1}: ${t.filename} ---\n${t.text||''}` ).join('\n\n');

    const fileObjects = [...(fileRefs||[]).map(r => ({
        path: path.join(UPLOADS_DIR, r.storedAs), originalname: r.originalname, filename: r.storedAs
      })),
      ...(texts||[]).filter(t=>t.storedAs).map(t => ({
        path: path.join(UPLOADS_DIR, t.storedAs), originalname: t.filename, filename: t.storedAs
      }))
    ].filter(f => fs.existsSync(f.path));

    const data = await extractLegalData(combinedText, reportType, bankName, firmName, fileObjects);
    res.json({ success: true, data });
  } catch(e) { console.error(e); res.status(500).json({ error: e.message }); }
});

// ── Generate Report ───────────────────────────────────────────────────────────
app.post('/api/generate-report', async (req, res) => {
  try {
    const { data, firmName, advocateName } = req.body;
    if (!data) return res.status(400).json({ error: 'No data provided' });
    const reportId  = uuidv4();
    const reportPath = path.join(REPORTS_DIR, `Report_${reportId}.docx`);
    await generateLegalReport(data, reportPath, firmName, advocateName);
    res.json({ success: true, reportId, downloadUrl: `/api/download-report/${reportId}` });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── Download Report ───────────────────────────────────────────────────────────
app.get('/api/download-report/:id', (req, res) => {
  const p = path.join(REPORTS_DIR, `Report_${req.params.id}.docx`);
  fs.existsSync(p) ? res.download(p, 'Legal_Scrutiny_Report.docx') : res.status(404).json({ error: 'Not found' });
});

// ── Serve React for all non-API routes (production) ──────────────────────────
if (IS_PRODUCTION) {
  const publicDir = path.join(__dirname, 'public');
  app.get('*', (req, res) => {
    const idx = path.join(publicDir, 'index.html');
    fs.existsSync(idx) ? res.sendFile(idx) : res.status(404).send('Not built');
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Legal Ops AI running on port ${PORT}`));
