require('./server.env');
const express = require('express');
const cors    = require('cors');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const os      = require('os');
const bcrypt  = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const SALT_ROUNDS = 10;

const { extractTextFromDocx } = require('./extractors/docxExtractor');
const { extractTextFromPdf }  = require('./extractors/pdfExtractor');
const { extractTextFromImage }= require('./extractors/imageExtractor');
const { extractLegalData }    = require('./ai/claudeExtractor');
const { generateLegalReport } = require('./generators/reportGenerator');

// ══════════════════════════════════════════════════════════════════════════════
//  SELF-HEALING AI AGENT — automatically catches and recovers from crashes
// ══════════════════════════════════════════════════════════════════════════════
const AGENT_LOG = [];
const MAX_LOG   = 100;

function agentLog(level, msg, ctx = {}) {
  const entry = { ts: new Date().toISOString(), level, msg, ...ctx };
  AGENT_LOG.unshift(entry);
  if (AGENT_LOG.length > MAX_LOG) AGENT_LOG.pop();
  console[level === 'error' ? 'error' : 'log'](`[AGENT ${level.toUpperCase()}] ${msg}`, ctx.error || '');
}

// Catch ALL unhandled promise rejections — prevent server crash
process.on('unhandledRejection', (reason, promise) => {
  agentLog('error', 'Unhandled promise rejection caught by agent', { error: String(reason) });
  // Do NOT exit — agent keeps server alive
});

// Catch ALL uncaught exceptions — prevent server crash
process.on('uncaughtException', (err) => {
  agentLog('error', 'Uncaught exception caught by agent', { error: err.message });
  // Do NOT exit — agent keeps server alive
});

// Self-healing middleware — wraps every route handler
function heal(fn) {
  return async (req, res, next) => {
    try {
      // Set keep-alive + generous timeout for long AI operations
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Keep-Alive', 'timeout=120');
      req.socket.setTimeout(120000); // 2 minutes
      res.setTimeout(120000);
      await fn(req, res, next);
    } catch(err) {
      agentLog('error', `Route ${req.method} ${req.path} crashed`, { error: err.message });
      if (!res.headersSent) {
        const msg  = err.message || 'Unknown error';
        const code = msg.includes('timeout') || msg.includes('502') ? 504 : 500;
        res.status(code).json({
          error: friendlyError(msg),
          agentNote: 'Error was caught by the self-healing agent. The server remains online.',
          retryable: code === 504 || msg.includes('rate_limit') || msg.includes('overload')
        });
      }
    }
  };
}

function friendlyError(msg) {
  if (msg.includes('502') || msg.includes('timeout') || msg.includes('ECONNRESET'))
    return 'Request timed out during AI processing. Please try with fewer/smaller documents, or retry.';
  if (msg.includes('credit') || msg.includes('billing'))
    return 'AI credits exhausted. Check GROQ_API_KEY in Render environment variables.';
  if (msg.includes('quota') || msg.includes('429') || msg.includes('rate_limit') || msg.includes('TPM'))
    return 'AI rate limit reached. Please wait 30 seconds and retry.';
  if (msg.includes('No AI API key') || msg.includes('GROQ_API_KEY'))
    return 'AI key not configured. Add GROQ_API_KEY in Render Dashboard → Environment.';
  if (msg.includes('JSON') || msg.includes('parse'))
    return 'AI returned an unexpected format. Please retry — this is transient.';
  if (msg.includes('413') || msg.includes('too large') || msg.includes('TPM'))
    return 'Document is too large for single processing. Try uploading fewer files at a time.';
  return msg;
}

const app = express();
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Increase server-level timeout to 120 seconds (prevents 502 on slow AI calls)
app.use((req, res, next) => {
  req.socket.setTimeout(120000);
  res.setTimeout(120000, () => {
    agentLog('warn', `Request timeout: ${req.method} ${req.path}`);
    if (!res.headersSent) {
      res.status(504).json({
        error: 'AI processing took too long. Try with fewer/smaller documents and retry.',
        retryable: true
      });
    }
  });
  next();
});

// ── Formats directory (admin-uploaded bank report templates) ──────────────────
const FORMATS_DIR = process.env.NODE_ENV === 'production'
  ? path.join(os.tmpdir(), 'legal-ops-formats')
  : path.join(__dirname, 'formats');
if (!fs.existsSync(FORMATS_DIR)) fs.mkdirSync(FORMATS_DIR, { recursive: true });

// ── Report types & banks config ───────────────────────────────────────────────
const REPORT_TYPES = [
  { value: 'APF', label: 'APF — Approved Project Finance' },
  { value: 'CF',  label: 'CF — Construction Finance' },
  { value: 'Legal', label: 'Legal Scrutiny Report' },
  { value: 'Vetting', label: 'Vetting Report' },
  { value: 'TSR', label: 'TSR — Title Search Report' },
  { value: 'OV',  label: 'OV — Original Verification' },
  { value: 'LAP', label: 'LAP — Loan Against Property' },
];

const BANK_LIST = [
  'Axis Bank Limited','State Bank of India','HDFC Bank','ICICI Bank',
  'ICICI Home Finance','Union Bank of India','LIC Housing Finance',
  'IndusInd Bank','Kotak Mahindra Bank','Aditya Birla Capital',
  'Bajaj Finance Limited','Federal Bank','Navi Finserv',
  'Shinhan Bank','Can Fin Homes','Vridhi Housing Finance',
  'TrueHome Finance','Techfino Capital','Credila Financial Services',
  'Jio Credit Limited','Godrej Finance','Capri Global Capital',
  'Hinduja Housing Finance','Tata Capital','Other Bank',
];

// ── Files store (track uploaded files per user) ───────────────────────────────
const FILES_STORE = path.join(os.tmpdir(), 'legal-ops-files.json');
function getFilesStore() {
  try { if (fs.existsSync(FILES_STORE)) return JSON.parse(fs.readFileSync(FILES_STORE,'utf8')); } catch(e) {}
  return [];
}
function saveFilesStore(files) { fs.writeFileSync(FILES_STORE, JSON.stringify(files,null,2)); }

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

// Register — passwords hashed with bcrypt
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, org, mobile } = req.body;
    if (!firstName || !lastName || !email || !password)
      return res.status(400).json({ error: 'All fields are required' });

    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
      return res.status(409).json({ error: 'Email already registered. Please sign in.' });

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = {
      id: uuidv4(), firstName, lastName,
      email: email.toLowerCase(), password: hashedPassword,
      org: org||'', mobile: mobile||'',
      role: 'client', status: 'pending', created: new Date().toISOString()
    };
    users.push(newUser);
    saveUsers(users);

    const { password: _, ...safeUser } = newUser;
    res.json({ success: true, user: safeUser, message: 'Registration submitted. Awaiting admin approval.' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Login — bcrypt password comparison
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    // Support both bcrypt hashed and plain (for seeded admin)
    const passwordMatch = user.password.startsWith('$2')
      ? await bcrypt.compare(password, user.password)
      : user.password === password;

    if (!passwordMatch) return res.status(401).json({ error: 'Invalid email or password' });

    // Auto-upgrade plain password to bcrypt on first login
    if (!user.password.startsWith('$2')) {
      user.password = await bcrypt.hash(password, SALT_ROUNDS);
      saveUsers(users);
    }

    if (user.status === 'pending')
      return res.status(403).json({ error: 'pending', message: 'Your account is awaiting admin approval.' });
    if (user.status === 'rejected')
      return res.status(403).json({ error: 'rejected', message: 'Your access request was not approved.' });

    const { password: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch(e) { res.status(500).json({ error: e.message }); }
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

// ── Config endpoints ──────────────────────────────────────────────────────────
app.get('/api/config/report-types', (req, res) => res.json({ reportTypes: REPORT_TYPES }));
app.get('/api/config/banks',        (req, res) => res.json({ banks: BANK_LIST }));

// ── Bank format templates (admin only) ───────────────────────────────────────
const fmtUpload = multer({ storage: multer.diskStorage({
  destination: (req,f,cb) => cb(null, FORMATS_DIR),
  filename: (req,f,cb) => {
    const safe = f.originalname.replace(/[^a-zA-Z0-9._-]/g,'_');
    cb(null, `${req.body.bank||'BANK'}_${req.body.reportType||'REPORT'}_${safe}`);
  }
}), limits: { fileSize: 20*1024*1024 } });

app.get('/api/formats', (req,res) => {
  const files = fs.existsSync(FORMATS_DIR)
    ? fs.readdirSync(FORMATS_DIR).map(f => {
        const s = fs.statSync(path.join(FORMATS_DIR,f));
        return { name:f, size:s.size, uploaded:s.mtime };
      })
    : [];
  res.json({ formats: files });
});

app.post('/api/formats/upload', fmtUpload.single('template'), heal(async (req,res) => {
  if (!req.file) return res.status(400).json({ error:'No file uploaded' });
  const user = getUsers().find(u=>u.email===req.body.email);
  if (!user || user.role !== 'admin') return res.status(403).json({ error:'Admin only' });
  agentLog('info', `Format uploaded: ${req.file.filename} by ${req.body.email}`);
  res.json({ success:true, name: req.file.filename });
}));

app.delete('/api/formats/:name', heal(async (req,res) => {
  const p = path.join(FORMATS_DIR, req.params.name);
  if (fs.existsSync(p)) { fs.unlinkSync(p); res.json({ success:true }); }
  else res.status(404).json({ error:'Not found' });
}));

// ── User files tracker ────────────────────────────────────────────────────────
app.get('/api/my-files', (req,res) => {
  const email = req.query.email;
  const all   = getFilesStore();
  const mine  = email ? all.filter(f=>f.uploadedBy===email) : all;
  const total   = mine.length;
  const pending = mine.filter(f=>f.status==='pending').length;
  const closed  = mine.filter(f=>f.status==='completed').length;
  res.json({ files:mine, total, pending, closed });
});

// ── Agent monitor endpoint ────────────────────────────────────────────────────
app.get('/api/agent', (req, res) => {
  res.json({
    status: 'self-healing agent active',
    uptime: Math.round(process.uptime()) + 's',
    memory: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB',
    recentErrors: AGENT_LOG.filter(l => l.level === 'error').slice(0, 10),
    recentWarnings: AGENT_LOG.filter(l => l.level === 'warn').slice(0, 5),
    totalEvents: AGENT_LOG.length,
    fixes: {
      unhandledRejections: 'caught — server stays alive',
      uncaughtExceptions: 'caught — server stays alive',
      routeTimeouts: '120s limit — returns 504 with retry hint',
      aiRateLimit: 'caught — returns friendly message',
      aiCredits: 'caught — returns setup instructions',
      jsonParseErrors: 'caught — returns retry message'
    }
  });
});

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const hasGroq     = !!process.env.GROQ_API_KEY;
  const hasAnthopic = !!process.env.ANTHROPIC_API_KEY;
  const hasGemini   = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  const aiProvider  = hasGroq ? 'groq (FREE Llama 3.3)' : hasAnthopic ? 'anthropic' : hasGemini ? 'gemini' : 'NONE';
  res.json({
    status: 'ok', message: 'Legal Ops AI System is running',
    ai: aiProvider, aiReady: hasGroq || hasAnthopic || hasGemini,
    uploadDir: UPLOADS_DIR, reportsDir: REPORTS_DIR
  });
});

// ── AI Key Test ───────────────────────────────────────────────────────────────
app.get('/api/test-ai', async (req, res) => {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const geminiKey    = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const results = {};

  // Test Groq (PRIMARY — FREE, no payment)
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const Groq = require('groq-sdk');
      const groq = new Groq({ apiKey: groqKey });
      await groq.chat.completions.create({ model: 'llama-3.3-70b-versatile', max_tokens: 5, messages: [{ role: 'user', content: 'hi' }] });
      results.groq = 'OK — FREE Llama 3.3 70B';
    } catch(e) {
      results.groq = e.message.includes('401') || e.message.includes('invalid') ? 'INVALID KEY — get new key at console.groq.com' : `ERROR: ${e.message.substring(0,100)}`;
    }
  } else { results.groq = 'NOT_SET — Get FREE key at https://console.groq.com (No payment needed)'; }

  // Test Anthropic (fallback)
  if (anthropicKey) {
    try {
      const { Anthropic } = require('@anthropic-ai/sdk');
      const client = new Anthropic({ apiKey: anthropicKey });
      await client.messages.create({ model: 'claude-sonnet-4-6', max_tokens: 5, messages: [{ role: 'user', content: 'hi' }] });
      results.anthropic = 'OK';
    } catch(e) {
      results.anthropic = e.message.includes('credit') || e.message.includes('billing') ? 'NO_CREDITS — top up at console.anthropic.com' : `ERROR: ${e.message.substring(0,100)}`;
    }
  } else { results.anthropic = 'NOT_SET'; }

  // Test Gemini (fallback)
  if (geminiKey) {
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const model = new GoogleGenerativeAI(geminiKey).getGenerativeModel({ model: 'gemini-2.0-flash' });
      await model.generateContent('hi');
      results.gemini = 'OK';
    } catch(e) {
      results.gemini = e.message.includes('quota') || e.message.includes('429') ? 'QUOTA_EXCEEDED — get new key at aistudio.google.com/app/apikey' : `ERROR: ${e.message.substring(0,100)}`;
    }
  } else { results.gemini = 'NOT_SET'; }

  const working = Object.values(results).some(v => v.startsWith('OK'));
  res.json({ working, results, fix: working ? 'All good!' : 'Get FREE Groq key at https://console.groq.com — set GROQ_API_KEY in Render Environment Variables' });
});

// ── Extract ───────────────────────────────────────────────────────────────────
app.post('/api/extract', upload.array('files', 50), heal(async (req, res) => {
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
}));  // heal() closes here

// ── Analyze ───────────────────────────────────────────────────────────────────
app.post('/api/analyze', heal(async (req, res) => {
  const { texts, fileRefs, reportType='APF',
          bankName='Axis Bank Limited',
          firmName='M/s. Aneesh Associates Private Limited',
          userEmail, userName } = req.body;

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

  agentLog('info', `Analyzing ${fileObjects.length} file(s) with ${reportType}/${bankName}`);
  const data = await extractLegalData(combinedText, reportType, bankName, firmName, fileObjects);
  agentLog('info', 'Analysis complete', { status: data.overallStatus });

  // Track this file for the user dashboard
  if (userEmail) {
    const store = getFilesStore();
    store.push({
      id: uuidv4(), uploadedBy: userEmail, userName: userName||userEmail,
      reportType, bankName, status: 'pending',
      fileCount: fileObjects.length, createdAt: new Date().toISOString(),
      overallStatus: data.overallStatus
    });
    saveFilesStore(store);
  }
  res.json({ success: true, data });
}));

// ── Generate Report ───────────────────────────────────────────────────────────
app.post('/api/generate-report', heal(async (req, res) => {
  const { data, firmName, advocateName } = req.body;
  if (!data) return res.status(400).json({ error: 'No data provided' });
  const reportId   = uuidv4();
  const reportPath = path.join(REPORTS_DIR, `Report_${reportId}.docx`);
  await generateLegalReport(data, reportPath, firmName, advocateName);
  agentLog('info', `Report generated: ${reportId}`);
  res.json({ success: true, reportId, downloadUrl: `/api/download-report/${reportId}` });
}));  // heal() closes here

// ── Close a file (staff/admin) ────────────────────────────────────────────────
app.patch('/api/my-files/:id', heal(async (req,res) => {
  const store = getFilesStore();
  const file  = store.find(f=>f.id===req.params.id);
  if (!file) return res.status(404).json({ error:'Not found' });
  file.status = req.body.status || 'completed';
  saveFilesStore(store);
  res.json({ success:true, file });
}));

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
