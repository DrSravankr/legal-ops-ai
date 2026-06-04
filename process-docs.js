/**
 * Legal Ops AI — Batch Document Processor
 *
 * Reads every PDF/image using Claude Vision, extracts VERBATIM content
 * in Axis Bank Legal Scrutiny Report style, detects title gaps,
 * and generates the full report.
 *
 * Usage:
 *   node process-docs.js [docs-folder] [bank-name] [report-type]
 *
 * Example:
 *   node process-docs.js "C:/Users/drsra/Downloads/legal-docs-extracted" "Axis Bank Limited" "APF"
 */

require('./backend/server.env');

const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!GEMINI_KEY || GEMINI_KEY === 'paste_your_AIza_key_here') {
  console.error('\n❌  GEMINI_API_KEY not set.');
  console.error('    1. Go to: https://aistudio.google.com/app/apikey');
  console.error('    2. Sign in with Google → Create API Key → Copy it');
  console.error('    3. Open: C:\\Users\\drsra\\legal-ops-system\\backend\\.env');
  console.error('    4. Replace paste_your_AIza_key_here with your key\n');
  process.exit(1);
}

const fs    = require('fs');
const path  = require('path');
const { extractLegalData }    = require('./backend/ai/claudeExtractor');
const { generateLegalReport } = require('./backend/generators/reportGenerator');

// ── Config ────────────────────────────────────────────────────────────────────
const DOCS_DIR   = process.argv[2] || 'C:/Users/drsra/Downloads/legal-docs-extracted';
const BANK_NAME  = process.argv[3] || 'Axis Bank Limited';
const RPT_TYPE   = process.argv[4] || 'APF — Approved Project Finance';
const FIRM_NAME  = 'M/s. Aneesh Associates Private Limited';
const ADVOCATE   = 'Dr. Sravan Kumar D';

const LEGAL_EXTS = ['.pdf', '.docx', '.doc', '.jpg', '.jpeg', '.png', '.tiff', '.tif', '.bmp', '.webp'];

// Priority order — most legally important documents first
// This ensures Claude reads the key title documents first for better context
const PRIORITY_KEYWORDS = [
  'sale deed', 'partition', 'jda', 'gpa', 'spa', 'conversion',
  'rtc', 'pahani', 'ec', 'encumbrance', 'mutation', 'mr',
  'rera', 'khata', 'katha', 'noc', 'bda', 'bbmp', 'tippani',
  'akarband', 'sketch', 'survey', 'moa', 'aoa',
];

function getFilePriority(name) {
  const n = name.toLowerCase();
  for (let i = 0; i < PRIORITY_KEYWORDS.length; i++) {
    if (n.includes(PRIORITY_KEYWORDS[i])) return i;
  }
  return PRIORITY_KEYWORDS.length;
}

// ── Skip patterns (too large / not legal docs) ────────────────────────────────
const SKIP_PATTERNS = ['tirumenahali.rar', 'thanisandra legal docs full set'];
const MAX_VISION_SIZE = 38 * 1024 * 1024; // 38 MB — Anthropic API limit per document

function shouldSkip(name, sizeBytes) {
  const n = name.toLowerCase();
  if (SKIP_PATTERNS.some(p => n.includes(p))) return true;
  return false; // no hard skip — oversized files get text-only fallback
}

function isTooLargeForVision(sizeBytes) {
  return sizeBytes > MAX_VISION_SIZE;
}

// ── Collect and sort files ────────────────────────────────────────────────────
function collectFiles(dir) {
  if (!fs.existsSync(dir)) {
    console.error('❌  Folder not found:', dir);
    process.exit(1);
  }

  const all = fs.readdirSync(dir)
    .filter(f => LEGAL_EXTS.includes(path.extname(f).toLowerCase()))
    .map(f => ({ name: f, fullPath: path.join(dir, f), size: fs.statSync(path.join(dir, f)).size }))
    .filter(f => !shouldSkip(f.name, f.size));

  // Sort by legal importance
  all.sort((a, b) => getFilePriority(a.name) - getFilePriority(b.name));
  return all;
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function progress(done, total, label) {
  const pct  = Math.round(done / total * 100);
  const bar  = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(20 - Math.round(pct / 5));
  process.stdout.write(`\r  [${bar}] ${pct}%  ${label.substring(0, 50).padEnd(52)}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n' + '═'.repeat(65));
  console.log('  Legal Ops AI — Verbatim Document Extractor');
  console.log('  Bank:', BANK_NAME, '|  Type:', RPT_TYPE);
  console.log('  Folder:', DOCS_DIR);
  console.log('═'.repeat(65) + '\n');

  const files = collectFiles(DOCS_DIR);
  console.log(`📂  Found ${files.length} legal documents\n`);
  files.forEach((f, i) => console.log(`  ${String(i + 1).padStart(3)}.  ${f.name}  (${(f.size / 1024).toFixed(0)} KB)`));

  console.log('\n' + '─'.repeat(65));
  console.log('🤖  Sending to Claude Vision — reading each document verbatim...\n');

  // Build file objects for the extractor
  const fileObjects = files.map(f => ({
    path: f.fullPath,
    originalname: f.name,
    filename: f.name,
  }));

  // Build a minimal combined text from filenames (real content comes from Vision)
  const combinedText = files.map(f =>
    `File: ${f.name} | Size: ${(f.size / 1024).toFixed(0)} KB`
  ).join('\n');

  let structuredData;
  try {
    structuredData = await extractLegalData(
      combinedText,
      RPT_TYPE,
      BANK_NAME,
      FIRM_NAME,
      fileObjects
    );
  } catch (e) {
    console.error('\n❌  AI extraction failed:', e.message);
    if (e.message.includes('401')) {
      console.error('    Check your ANTHROPIC_API_KEY in backend/.env');
    }
    process.exit(1);
  }

  // Save extracted data
  const dataPath = path.join(DOCS_DIR, '..', 'extracted_data.json');
  fs.writeFileSync(dataPath, JSON.stringify(structuredData, null, 2));
  console.log('\n✅  Data extracted → ' + dataPath);

  // Print gap summary
  const gaps = structuredData.titleGaps || [];
  if (gaps.length > 0) {
    console.log('\n⚠️   TITLE GAPS FOUND:', gaps.length);
    gaps.forEach((g, i) => {
      const icon = g.severity === 'HIGH' ? '🔴' : g.severity === 'MEDIUM' ? '🟠' : '🟡';
      console.log(`  ${icon}  ${i + 1}. [Sy.No.${g.syNo || '?'}] ${g.description || g.gapDescription}`);
    });
  } else {
    console.log('\n✅  No title gaps detected.');
  }

  // Generate DOCX report
  console.log('\n📝  Generating DOCX report...');
  const timestamp   = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const reportPath  = path.join(DOCS_DIR, '..', `Legal_Scrutiny_Report_${timestamp}.docx`);

  try {
    await generateLegalReport(structuredData, reportPath, FIRM_NAME, ADVOCATE);
  } catch (e) {
    console.error('❌  Report generation failed:', e.message);
    process.exit(1);
  }

  console.log('\n' + '═'.repeat(65));
  console.log('✅  REPORT GENERATED SUCCESSFULLY');
  console.log('   File:', reportPath);
  console.log('   Status:', structuredData.overallStatus || 'CONDITIONALLY CLEAR');
  console.log('   Documents listed:', (structuredData.documentsFurnished || []).filter(d => !d.isGap && !d.isSubHeader).length);
  console.log('   Title gaps flagged:', gaps.length);
  console.log('   Summary:', structuredData.summary || '');
  console.log('═'.repeat(65) + '\n');
}

main().catch(e => {
  console.error('\n💥  Fatal error:', e.message);
  console.error(e.stack);
  process.exit(1);
});
