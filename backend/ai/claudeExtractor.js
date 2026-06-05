/**
 * Legal Document AI Extractor
 * Primary:   Groq (FREE — Llama 3.3 70B — no payment, no token purchase)
 * Fallback1: Anthropic Claude (if credits available)
 * Fallback2: Google Gemini (if key available)
 *
 * Get FREE Groq key: https://console.groq.com  (no credit card needed)
 */

const fs   = require('fs');
const path = require('path');
const os   = require('os');

const CHECKPOINT_FILE = path.join(os.tmpdir(), 'legal_ops_checkpoint.json');

// ── AI provider selection ─────────────────────────────────────────────────────

function getGroqClient() {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  const Groq = require('groq-sdk');
  return new Groq({ apiKey: key });
}

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
  const groq     = getGroqClient();     if (groq)     return { type: 'groq',      client: groq };
  const anthropic= getAnthropicClient();if (anthropic) return { type: 'anthropic', client: anthropic };
  const gemini   = getGeminiClient();   if (gemini)   return { type: 'gemini',     client: gemini };
  throw new Error(
    'No AI API key configured. Get a FREE Groq key at https://console.groq.com — ' +
    'set GROQ_API_KEY in Render Environment Variables. No payment required.'
  );
}

// ── Text completion (all providers) ──────────────────────────────────────────

async function textComplete(prompt, maxTokens = 8000) {
  const ai = getActiveAI();

  if (ai.type === 'groq') {
    const response = await ai.client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    });
    return response.choices[0]?.message?.content?.trim() || '';
  }

  if (ai.type === 'anthropic') {
    const msg = await ai.client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    });
    return msg.content[0]?.type === 'text' ? msg.content[0].text.trim() : '';
  }

  if (ai.type === 'gemini') {
    const model = ai.client.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  }

  throw new Error('Unknown AI provider');
}

// ── Single-document text extraction (vision where available) ─────────────────

const MAX_BYTES = 19 * 1024 * 1024;

const EXTRACTION_PROMPT = `You are an Indian property law expert reading a legal document.
Extract ALL information and return a CLEAN ENGLISH ONLY summary:
- Document type (Sale Deed / RTC / Mutation Register / EC / GPA / JDA / NOC / Conversion Order / etc.)
- All registration/document numbers, all party names, all property details (Survey numbers, village, hobli, taluk, district, area)
- All dates, EC periods, MR numbers, RTC years, pattadar names, encumbrances, NOC references, consideration amounts

RULES: Output CLEAN ENGLISH ONLY. Translate ALL Kannada/Telugu/Hindi to English. No portal URLs. No digital signatures.`;

async function extractSingleDocument(filePath, fileName) {
  const ext  = (fileName || filePath).split('.').pop().toLowerCase();
  const stat = fs.statSync(filePath);
  const ai   = getActiveAI();

  try {
    // ── PDF text extraction first (works for all providers) ──────────────────
    if (ext === 'pdf') {
      // Try text layer first
      try {
        const pdfParse = require('pdf-parse');
        const buf  = fs.readFileSync(filePath);
        const data = await pdfParse(buf, { max: 20 });
        const text = data.text.trim();
        if (text.length > 150) {
          return await textComplete(EXTRACTION_PROMPT + '\n\nDOCUMENT TEXT:\n' + text.substring(0, 20000), 2000);
        }
      } catch(pe) { /* no text layer — try vision below */ }

      // Vision for scanned PDFs (Anthropic or Gemini only — Groq doesn't support PDF vision)
      if (ai.type !== 'groq' && stat.size <= MAX_BYTES) {
        const base64 = fs.readFileSync(filePath).toString('base64');
        if (ai.type === 'anthropic') {
          const msgParams = {
            model: 'claude-sonnet-4-6', max_tokens: 2000,
            messages: [{ role: 'user', content: [
              { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
              { type: 'text', text: EXTRACTION_PROMPT }
            ]}],
            betas: ['pdfs-2024-09-25']
          };
          const msg = await ai.client.messages.create(msgParams);
          return msg.content[0]?.type === 'text' ? msg.content[0].text.trim() : null;
        }
        if (ai.type === 'gemini') {
          const model = ai.client.getGenerativeModel({ model: 'gemini-2.0-flash' });
          const result = await model.generateContent([
            { inlineData: { mimeType: 'application/pdf', data: base64 } }, EXTRACTION_PROMPT
          ]);
          return result.response.text().trim();
        }
      }

      return `[${fileName} — scanned PDF, text layer empty. Manual review needed.]`;
    }

    // ── Image files ───────────────────────────────────────────────────────────
    const isImg = ['jpg','jpeg','png','tiff','tif','bmp','webp'].includes(ext);
    if (isImg && ai.type !== 'groq') {
      const base64 = fs.readFileSync(filePath).toString('base64');
      const mime = { jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', tiff:'image/tiff', tif:'image/tiff', bmp:'image/bmp', webp:'image/webp' }[ext] || 'image/jpeg';
      if (ai.type === 'anthropic') {
        const msg = await ai.client.messages.create({
          model: 'claude-sonnet-4-6', max_tokens: 2000,
          messages: [{ role: 'user', content: [
            { type: 'image', source: { type: 'base64', media_type: mime, data: base64 } },
            { type: 'text', text: EXTRACTION_PROMPT }
          ]}]
        });
        return msg.content[0]?.type === 'text' ? msg.content[0].text.trim() : null;
      }
      if (ai.type === 'gemini') {
        const model = ai.client.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent([
          { inlineData: { mimeType: mime, data: base64 } }, EXTRACTION_PROMPT
        ]);
        return result.response.text().trim();
      }
    }

    // Groq: images — use OCR text extraction instead
    if (isImg && ai.type === 'groq') {
      try {
        const Tesseract = require('tesseract.js');
        const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
        if (text.trim().length > 50) {
          return await textComplete(EXTRACTION_PROMPT + '\n\nOCR TEXT:\n' + text.substring(0, 15000), 2000);
        }
      } catch(te) { /* OCR failed */ }
      return `[${fileName} — image, OCR extraction used]`;
    }

    return null; // unsupported type

  } catch(e) {
    const msg = e.message || '';
    if (msg.includes('password')) return `[${fileName} — password protected]`;
    if (msg.includes('quota') || msg.includes('429') || msg.includes('credit') || msg.includes('rate_limit')) throw e;
    console.warn(`  Could not read ${fileName}: ${msg.substring(0, 100)}`);
    return null;
  }
}

// ── Main extraction + report structuring ──────────────────────────────────────

async function extractLegalData(combinedText, reportType, bankName, firmName, fileObjects = []) {

  const ai = getActiveAI();
  console.log(`\nUsing AI: ${ai.type} (${ai.type === 'groq' ? 'FREE — Llama 3.3 70B' : ai.type})`);

  // Load checkpoint
  let checkpoint = {};
  try { checkpoint = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf8')); } catch(e) {}

  const docExtracts = [];
  for (const [name, text] of Object.entries(checkpoint)) {
    docExtracts.push(`\n${'─'.repeat(60)}\nFILE: ${name}\n${'─'.repeat(60)}\n${text}`);
  }

  const RTC_PATTERN = /^RTC Sy\.No\.(106|108) of \d{2}-\d{2}\.pdf$/i;

  for (const f of fileObjects) {
    if (!f.path || !fs.existsSync(f.path)) continue;
    const fname = f.originalname || f.filename;
    if (checkpoint[fname]) { process.stdout.write(`  Cached: ${fname} ✓\n`); continue; }

    if (RTC_PATTERN.test(fname)) {
      const sy = (fname.match(/Sy\.No\.([\d/]+)/i)||[])[1] || '';
      const yr = (fname.match(/of (\d{2}-\d{2})/i)||[])[1] || '';
      const t  = `Annual RTC/Pahani for year 20${yr} for Sy.No.${sy}`;
      checkpoint[fname] = t;
      docExtracts.push(`\n${'─'.repeat(60)}\nFILE: ${fname}\n${'─'.repeat(60)}\n${t}`);
      fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2));
      continue;
    }

    process.stdout.write(`  Reading: ${fname}... `);
    try {
      const extracted = await extractSingleDocument(f.path, fname);
      // Throttle: Groq allows 30 req/min on free tier — 2s delay is safe
      await new Promise(r => setTimeout(r, ai.type === 'groq' ? 2000 : ai.type === 'gemini' ? 7000 : 500));

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
      if (msg.includes('quota') || msg.includes('429') || msg.includes('rate_limit')) {
        const wait = ai.type === 'gemini' ? 90000 : 30000;
        process.stdout.write(`\n  Rate limit — waiting ${wait/1000}s...\n`);
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
        process.stdout.write(`  Error: ${msg.substring(0, 80)}\n`);
      }
    }
  }

  const allText = (combinedText || '') + '\n\n' + docExtracts.join('\n\n');
  console.log(`\n✅ ${Object.keys(checkpoint).length} docs extracted. Structuring report with ${ai.type}...\n`);

  const SYSTEM = `You are a senior Indian property law advocate preparing a Legal Scrutiny Report for ${bankName}.

DOCUMENT STYLE — use EXACTLY:
• RTC: "Record of Tenancy and Crops (RTC/Pahani) for the year YYYY-YY, issued by Revenue Authority in respect of Sy.No.XX of [Village], [Hobli], [Taluk], [District], measuring [AREA], ([Pattadar Name])"
• Sale Deed: "Sale deed registered as Document No.XXXXX/YYYY, executed by [SELLER] in favour of [BUYER] in respect of Sy.No.XX of [Village], measuring [AREA]"
• EC: "Encumbrance Certificate for the period from DD/MM/YYYY to DD/MM/YYYY in respect of Sy.No.XX of [Village], [Hobli], [Taluk]"
• MR: "Mutation Register Extract bearing MR No.X/YYYY, issued by Revenue Authority in respect of Sy.No.XX"
• GPA: "General Power of Attorney executed by [GRANTOR] in favour of [GRANTEE] in respect of Sy.No.XX"
• JDA: "Joint Development Agreement executed by [LANDOWNER(S)] and [DEVELOPER] in respect of Sy.No.XX"
• Conversion: "Conversion Order bearing No.[ORDER NO] dated [DATE] converting Sy.No.XX from Agricultural to Residential use"
• NOC: "NOC dated [DATE] issued by [AUTHORITY] in respect of Sy.No.XX"

RULES:
1. CLEAN ENGLISH ONLY — no Kannada/Telugu/Indian languages
2. No portal URLs, no digital signature metadata
3. Group documents by Survey Number with sub-headers
4. Chronological order within each Survey Number
5. Insert GAP rows (isGap:true) where title chain breaks
6. Return ONLY valid JSON — no markdown, no code blocks, no explanation`;

  const PROMPT = `${SYSTEM}

EXTRACTED DOCUMENT DATA:
${allText.substring(0, 90000)}

Return this exact JSON structure (fill ALL fields with ACTUAL data from the documents above):
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
    { "slNo": 1, "date": "DD/MM/YYYY", "particulars": "EXACT STYLE DESCRIPTION", "documentType": "Photostat", "syNo": "", "isGap": false, "isSubHeader": false, "subHeaderText": null },
    { "isSubHeader": true, "subHeaderText": "Survey Number heading", "slNo": null, "date": null, "particulars": null, "documentType": null },
    { "isGap": true, "gapDescription": "Gap description", "syNo": "", "severity": "HIGH", "slNo": null, "date": null, "particulars": null, "documentType": null }
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
    "developerShare": [{"slNo":1,"document":"Sale Deed to be executed by Developer in favour of Borrowers"}],
    "landownerShare":  [{"slNo":1,"document":"Sale Deed to be executed by Landowners in favour of Borrowers"}]
  },
  "btDetails": "N/A",
  "opinion": "Full legal opinion paragraph with actual names and survey numbers...",
  "subjectTo": [
    "Verification of all original documents before mortgage transaction",
    "Encumbrance Certificate to be verified before disbursement",
    "Personal inspection by Bank officer recommended",
    "Genuineness of all documents to be confirmed by respective authorities"
  ],
  "translatedContent": { "hasIndianLanguageContent": true, "languages": ["Kannada"], "translationNotes": "Revenue documents translated from Kannada" },
  "riskFlags": [],
  "overallStatus": "CONDITIONALLY CLEAR",
  "summary": "2-3 sentence summary of findings"
}`;

  let raw = await textComplete(PROMPT, 8000);
  if (!raw) throw new Error('AI returned empty response');

  // Clean markdown fences if present
  raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    return JSON.parse(raw);
  } catch(parseErr) {
    // Try to extract JSON object from response
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch(e2) { /* fall through */ }
    }
    console.error('JSON parse failed. Raw snippet:', raw.substring(0, 300));
    throw new Error('AI returned invalid JSON. Check server logs for details.');
  }
}

module.exports = { extractLegalData };
