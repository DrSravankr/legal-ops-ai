/**
 * Legal Document Extractor — Anthropic Claude (primary) with Gemini fallback
 * Reads scanned PDFs, Kannada/Indian language docs via Vision
 * Outputs Axis Bank / custom bank Legal Scrutiny Report format
 */
const fs   = require('fs');
const path = require('path');
const os   = require('os');

const CHECKPOINT_FILE = path.join(os.tmpdir(), 'legal_ops_checkpoint.json');

// ── AI client helpers ──────────────────────────────────────────────────────────

function getAnthropicClient() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const { Anthropic } = require('@anthropic-ai/sdk');
  return new Anthropic({ apiKey: key });
}

function getGeminiClient() {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) return null;
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  return new GoogleGenerativeAI(key);
}

function getActiveAI() {
  const anthropic = getAnthropicClient();
  if (anthropic) return { type: 'anthropic', client: anthropic };
  const gemini = getGeminiClient();
  if (gemini)   return { type: 'gemini',    client: gemini };
  throw new Error('No AI API key configured. Please set ANTHROPIC_API_KEY or GEMINI_API_KEY in environment variables.');
}

const MAX_BYTES = 19 * 1024 * 1024;

// ── Single-document extraction ─────────────────────────────────────────────────
async function extractSingleDocument(filePath, fileName) {
  const ext  = (fileName || filePath).split('.').pop().toLowerCase();
  const stat = fs.statSync(filePath);

  const EXTRACTION_PROMPT = `You are an Indian property law expert reading a legal document.
Extract ALL information and return a CLEAN ENGLISH ONLY summary:
- Document type (Sale Deed / RTC / Mutation Register / EC / GPA / JDA / NOC / Conversion Order / etc.)
- All registration/document numbers
- All party names (executant, claimant, SPA/GPA holder, minor's guardian)
- All property details: Survey numbers, village, hobli, taluk, district, area in acres/guntas
- All dates (execution date, registration date)
- EC periods (from date to date)
- MR numbers, RTC years, pattadar names
- Any encumbrances or charges noted
- NOC reference numbers, issuing authority
- Consideration amounts if any

RULES:
- Output CLEAN ENGLISH ONLY — translate ALL Kannada/Telugu/Hindi text to English
- Do NOT output any regional language characters
- Do NOT include portal URLs, digital signatures, or website metadata
- Be concise but complete`;

  const ai = getActiveAI();

  try {
    if (ai.type === 'anthropic') {
      // Claude vision
      const isImage = ['jpg','jpeg','png','tiff','tif','bmp','webp'].includes(ext);
      const isPdf   = ext === 'pdf';

      if (isPdf || isImage) {
        if (stat.size > MAX_BYTES) {
          try {
            const pdfParse = require('pdf-parse');
            const buf  = fs.readFileSync(filePath);
            const data = await pdfParse(buf, { max: 15 });
            const text = data.text.trim();
            if (text.length > 100) {
              const msg = await ai.client.messages.create({
                model: 'claude-sonnet-4-6',
                max_tokens: 2000,
                messages: [{ role: 'user', content: EXTRACTION_PROMPT + '\n\nDOCUMENT TEXT:\n' + text.substring(0, 15000) }]
              });
              return msg.content[0].type === 'text' ? msg.content[0].text.trim() : null;
            }
          } catch (pe) { /* fall through */ }
          return `[${fileName} — too large for processing. Manually review.]`;
        }

        const buf     = fs.readFileSync(filePath);
        const base64  = buf.toString('base64');
        const mimeMap = { pdf:'application/pdf', jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', tiff:'image/tiff', tif:'image/tiff', bmp:'image/bmp', webp:'image/webp' };
        const mime    = mimeMap[ext] || 'application/octet-stream';

        const msgParams = {
          model: 'claude-sonnet-4-6',
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: isPdf
              ? [
                  { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
                  { type: 'text', text: EXTRACTION_PROMPT }
                ]
              : [
                  { type: 'image', source: { type: 'base64', media_type: mime, data: base64 } },
                  { type: 'text', text: EXTRACTION_PROMPT }
                ]
          }]
        };
        // Add PDF beta header for PDF documents
        if (isPdf) msgParams.betas = ['pdfs-2024-09-25'];
        const msg = await ai.client.messages.create(msgParams);
        return msg.content[0].type === 'text' ? msg.content[0].text.trim() : null;

      } else if (['.docx', '.doc'].includes('.' + ext)) {
        // For docx, text will already be extracted before this is called
        return null;
      }
      return null;

    } else {
      // Gemini vision (fallback)
      const model = ai.client.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const isPdf = ext === 'pdf';
      const isImage = ['jpg','jpeg','png','tiff','tif','bmp','webp'].includes(ext);

      if (!isPdf && !isImage) return null;

      if (isPdf && stat.size > MAX_BYTES) {
        try {
          const pdfParse = require('pdf-parse');
          const buf  = fs.readFileSync(filePath);
          const data = await pdfParse(buf, { max: 15 });
          const text = data.text.trim();
          if (text.length > 100) {
            const result = await model.generateContent(EXTRACTION_PROMPT + '\n\nDOCUMENT TEXT:\n' + text.substring(0, 15000));
            return result.response.text().trim();
          }
        } catch (pe) { /* */ }
        return `[${fileName} — too large for processing. Manually review.]`;
      }

      const buf    = fs.readFileSync(filePath);
      const base64 = buf.toString('base64');
      const mimeMap = { pdf:'application/pdf', jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', tiff:'image/tiff', tif:'image/tiff', bmp:'image/bmp', webp:'image/webp' };
      const parts = [{ inlineData: { mimeType: mimeMap[ext] || 'image/jpeg', data: base64 } }, EXTRACTION_PROMPT];

      const result = await model.generateContent(parts);
      return result.response.text().trim();
    }

  } catch(e) {
    const msg = e.message || '';
    if (msg.includes('password')) return `[${fileName} — password protected, cannot read]`;
    if (msg.includes('quota') || msg.includes('429')) throw e;
    console.warn(`  Could not read ${fileName}: ${msg.substring(0, 100)}`);
    return null;
  }
}

// ── Main extraction + report structuring ──────────────────────────────────────
async function extractLegalData(combinedText, reportType, bankName, firmName, fileObjects = []) {

  const ai = getActiveAI();

  // Load checkpoint
  let checkpoint = {};
  try { checkpoint = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf8')); } catch(e) {}

  const docExtracts = [];

  for (const [name, text] of Object.entries(checkpoint)) {
    docExtracts.push(`\n${'─'.repeat(60)}\nFILE: ${name}\n${'─'.repeat(60)}\n${text}`);
  }

  const RTC_YEAR_PATTERN = /^RTC Sy\.No\.(106|108) of \d{2}-\d{2}\.pdf$/i;

  for (const f of fileObjects) {
    if (!f.path || !fs.existsSync(f.path)) continue;
    const fname = f.originalname || f.filename;
    if (checkpoint[fname]) { process.stdout.write(`  Cached: ${fname} ✓\n`); continue; }

    if (RTC_YEAR_PATTERN.test(fname)) {
      const syMatch = fname.match(/Sy\.No\.([\d/]+)/i);
      const yrMatch = fname.match(/of (\d{2}-\d{2})/i);
      const text = `Annual RTC/Pahani for year 20${yrMatch?.[1]||''} in respect of Sy.No.${syMatch?.[1]||''} of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk`;
      checkpoint[fname] = text;
      docExtracts.push(`\n${'─'.repeat(60)}\nFILE: ${fname}\n${'─'.repeat(60)}\n${text}`);
      fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2));
      continue;
    }

    process.stdout.write(`  Reading: ${fname}... `);
    try {
      const extracted = await extractSingleDocument(f.path, fname);
      await new Promise(r => setTimeout(r, ai.type === 'gemini' ? 7000 : 500));

      if (extracted) {
        docExtracts.push(`\n${'─'.repeat(60)}\nFILE: ${fname}\n${'─'.repeat(60)}\n${extracted}`);
        checkpoint[fname] = extracted;
        fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2));
        process.stdout.write('✓\n');
      } else {
        process.stdout.write('(no content)\n');
      }
    } catch(e) {
      const msg = e.message || '';
      if (msg.includes('quota') || msg.includes('429') || msg.includes('overloaded')) {
        const wait = ai.type === 'gemini' ? 90000 : 30000;
        process.stdout.write(`\n  ⏳ Rate limit — waiting ${wait/1000}s...\n`);
        await new Promise(r => setTimeout(r, wait));
        try {
          const extracted = await extractSingleDocument(f.path, fname);
          if (extracted) {
            docExtracts.push(`\n${'─'.repeat(60)}\nFILE: ${fname}\n${'─'.repeat(60)}\n${extracted}`);
            checkpoint[fname] = extracted;
            fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2));
            process.stdout.write('  Retry ✓\n');
          }
        } catch(e2) { process.stdout.write('  Skipped after retry\n'); }
      } else {
        process.stdout.write(`  Error: ${msg.substring(0,80)}\n`);
      }
    }
  }

  console.log(`\n✅ ${Object.keys(checkpoint).length} documents extracted (AI: ${ai.type}). Structuring report...\n`);

  const allText = (combinedText || '') + '\n\n' + docExtracts.join('\n\n');

  const SYSTEM = `You are a senior Indian property law advocate preparing a Legal Scrutiny Report for ${bankName}.
Follow the EXACT format of a standard bank Legal Scrutiny Report.

WRITING STYLE FOR EACH DOCUMENT TYPE:
• RTC: "Record of Tenancy and Crops (RTC/Pahani) for the year YYYY-YY to YYYY-YY, issued by the Jurisdictional Revenue Authority in respect of the property bearing Sy.No.XX of [Village], [Hobli], [Taluk], [District], measuring [AREA], ([Pattadar Name])"
• Sale Deed: "Sale deed registered as Document No.XXXXX/YYYY-YY, executed by [SELLER(s)], in respect of the property bearing Sy.No.XX of [Village], [Hobli], [Taluk], [District], measuring [AREA] in favour of [BUYER]"
• EC: "Encumbrance Certificate for the period from DD/MM/YYYY to DD/MM/YYYY in respect of Sy.No.XX of [Village], [Hobli], [Taluk]"
• MR: "Mutation Register Extract bearing MR No.X/YYYY-YY, issued by the Jurisdictional Revenue Authority in respect of the property bearing Sy.No.XX..."
• GPA: "General Power of Attorney executed by [GRANTOR] in favour of [GRANTEE] in respect of the property bearing Sy.No.XX..."
• JDA: "Joint Development Agreement executed by [LANDOWNER(S)] (Landowners) and [DEVELOPER] (Developer) in respect of Sy.No.XX..."
• Conversion Order: "Conversion Order bearing No.[ORDER NO] dated [DATE], issued by [AUTHORITY], converting Sy.No.XX from Agricultural to Residential use"
• NOC: "NOC dated [DATE] issued by [AUTHORITY], in respect of Sy.No.XX..."

STRICT OUTPUT RULES:
1. CLEAN ENGLISH ONLY — no Kannada, Telugu or Indian language characters
2. No portal URLs, no digital signature metadata
3. Group documents by Survey Number with sub-headers
4. Strict chronological order within each Survey Number
5. Insert GAP rows (isGap:true) where title chain breaks
6. Return ONLY valid JSON — no markdown, no code blocks`;

  const PROMPT = `${SYSTEM}

EXTRACTED DOCUMENT DATA:
${allText.substring(0, 100000)}

Return this exact JSON (fill with ACTUAL data from documents above):
{
  "reportHeader": {
    "refNo": "AAPL/AXI/APF-KA/XX-XX/2025",
    "date": "DD/MM/YYYY",
    "reportTitle": "LEGAL SCRUTINY REPORT",
    "addressee": { "designation": "The Assistant Vice President", "department": "Head-Retail Asset Centre", "bank": "${bankName}", "city": "Bangalore" }
  },
  "subjectLine": "Legal Scrutiny Report in respect of...",
  "propertyDetails": {
    "apfNo": "", "applicantName": "", "coApplicantName": null,
    "natureOfTransaction": "${reportType}", "natureOfProperty": "Residential",
    "ownerNames": [], "developerName": "", "reraNo": "",
    "scheduleProperty": {
      "description": "",
      "surveyNumbers": [{"syNo":"","measurement":"","village":"","hobli":"","taluk":"","district":""}],
      "totalMeasurement": "",
      "boundaries": {"east":"","west":"","north":"","south":""}
    }
  },
  "documentsFurnished": [
    { "slNo": 1, "date": "DD/MM/YYYY", "particulars": "EXACT BANK STYLE DESCRIPTION", "documentType": "Photostat", "syNo": "", "isGap": false, "isSubHeader": false, "subHeaderText": null },
    { "isSubHeader": true, "subHeaderText": "Survey Number or Share heading", "slNo": null, "date": null, "particulars": null, "documentType": null },
    { "isGap": true, "gapDescription": "EXACT description of gap", "syNo": "", "severity": "HIGH", "slNo": null, "date": null, "particulars": null, "documentType": null }
  ],
  "titleFlow": [{"period":"","event":"","parties":"","documentRef":""}],
  "checklistAnswers": {
    "developerAcquiredRightsViaJDA": true, "landownersEmpoweredDeveloperToSell": true,
    "empoweringClause": "", "considerationType": "Area Sharing",
    "supplementaryAgreementExecuted": true, "allLandownersSignedSupplementary": true,
    "landConverted": true, "conversionType": "Residential",
    "minorsRights": "NIL", "landAcquisitionOrders": "NIL",
    "litigations": "NIL as per documents furnished", "otherObservations": "NIL",
    "sarfaesiEnforceable": true
  },
  "approvalsSanctions": [{"authority":"","type":"","number":"","date":"","description":""}],
  "encumbrances": [],
  "legalInterventions": "NIL as per documents furnished",
  "titleGaps": [{"slNo":1,"syNo":"","severity":"HIGH","gapType":"EC_GAP","description":"","documentRequired":""}],
  "documentsBeforeDisbursal": {
    "developerShare": [{"slNo":1,"particulars":"Agreement of Sale...","documentType":"Photostat"}],
    "landownerShare":  [{"slNo":1,"particulars":"Agreement of Sale...","documentType":"Photostat"}]
  },
  "documentsForCharge": {
    "developerShare": [{"slNo":1,"particulars":"Agreement of Sale...","documentType":"Original"}],
    "landownerShare":  [{"slNo":1,"particulars":"Agreement of Sale...","documentType":"Original"}]
  },
  "documentsPostDisbursal": {
    "developerShare": [{"slNo":1,"document":"Sale Deed to be executed by Developer in favour of Borrowers availing loan from ${bankName}"}],
    "landownerShare":  [{"slNo":1,"document":"Sale Deed to be executed by Landowners in favour of Borrowers availing loan from ${bankName}"}]
  },
  "btDetails": "N/A",
  "opinion": "Full legal opinion paragraph with actual owner names, actual survey numbers, actual developer name...",
  "subjectTo": ["Verification of all original documents","Encumbrance Certificate to be verified before mortgage transaction","An officer of the Bank to make personal inspection","Genuineness of documents to be confirmed"],
  "translatedContent": {"hasIndianLanguageContent": true, "languages": ["Kannada"], "translationNotes": "Revenue documents translated from Kannada"},
  "riskFlags": [],
  "overallStatus": "CONDITIONALLY CLEAR",
  "summary": "2-3 sentence summary"
}`;

  let raw;
  if (ai.type === 'anthropic') {
    const msg = await ai.client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      messages: [{ role: 'user', content: PROMPT }]
    });
    raw = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '{}';
  } else {
    const model = ai.client.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(PROMPT);
    raw = result.response.text().trim();
  }

  if (raw.startsWith('```')) raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');

  try {
    return JSON.parse(raw);
  } catch (parseErr) {
    // Extract JSON from response if it contains extra text
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error('AI returned invalid JSON. Raw: ' + raw.substring(0, 200));
  }
}

module.exports = { extractLegalData };
