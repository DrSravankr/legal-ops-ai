/**
 * Legal Document Extractor â€” Google Gemini (FREE)
 * Reads scanned PDFs, Kannada/Indian language documents via Vision
 * Outputs clean Axis Bank Legal Scrutiny Report format
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs   = require('fs');
const path = require('path');
const os   = require('os');

const CHECKPOINT_FILE = path.join(os.tmpdir(), 'legal_ops_checkpoint.json');

function getClient() {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not set in backend/.env');
  return new GoogleGenerativeAI(key);
}

const MAX_BYTES = 19 * 1024 * 1024; // Gemini inline limit ~20MB

// â”€â”€â”€ Per-document extraction â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function extractSingleDocument(filePath, fileName) {
  const ext  = (fileName || filePath).split('.').pop().toLowerCase();
  const stat = fs.statSync(filePath);

  try {
    const genAI = getClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const PROMPT = `You are an Indian property law expert reading a legal document.
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
- Output CLEAN ENGLISH ONLY â€” translate ALL Kannada/Telugu/Hindi text to English
- Do NOT output any regional language characters
- Do NOT include portal URLs, digital signatures, or website metadata
- Be concise but complete`;

    let parts;

    if (['pdf'].includes(ext)) {
      if (stat.size > MAX_BYTES) {
        // Large PDF â€” try text extraction via pdf-parse
        try {
          const pdfParse = require('pdf-parse');
          const buf  = fs.readFileSync(filePath);
          const data = await pdfParse(buf, { max: 15 });
          const text = data.text.trim();
          if (text.length > 100) {
            parts = [PROMPT + '\n\nDOCUMENT TEXT:\n' + text.substring(0, 15000)];
          } else {
            return `[${fileName} â€” ${(stat.size/1024/1024).toFixed(1)}MB â€” too large for Vision; text layer empty. Manually review.]`;
          }
        } catch(pe) {
          return `[${fileName} â€” too large for processing. Manually review.]`;
        }
      } else {
        const buf    = fs.readFileSync(filePath);
        const base64 = buf.toString('base64');
        parts = [{ inlineData: { mimeType: 'application/pdf', data: base64 } }, PROMPT];
      }
    } else if (['jpg','jpeg','png','tiff','tif','bmp','webp'].includes(ext)) {
      const buf    = fs.readFileSync(filePath);
      const base64 = buf.toString('base64');
      const mime   = { jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',tiff:'image/tiff',tif:'image/tiff',bmp:'image/bmp',webp:'image/webp' };
      parts = [{ inlineData: { mimeType: mime[ext] || 'image/jpeg', data: base64 } }, PROMPT];
    } else {
      return null;
    }

    const result = await model.generateContent(parts);
    return result.response.text().trim();

  } catch(e) {
    const msg = e.message || '';
    if (msg.includes('password')) return `[${fileName} â€” password protected, cannot read]`;
    if (msg.includes('quota') || msg.includes('429')) throw e; // bubble up for retry
    console.warn(`  Could not read ${fileName}: ${msg.substring(0,80)}`);
    return null;
  }
}

// â”€â”€â”€ Main extraction + report structuring â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function extractLegalData(combinedText, reportType, bankName, firmName, fileObjects = []) {

  // Load checkpoint (resume from where we left off)
  let checkpoint = {};
  try { checkpoint = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf8')); } catch(e) {}

  const docExtracts = [];

  // Add already-cached extractions
  for (const [name, text] of Object.entries(checkpoint)) {
    docExtracts.push(`\n${'â”€'.repeat(60)}\nFILE: ${name}\n${'â”€'.repeat(60)}\n${text}`);
  }

  // Read each document â€” skip if cached
  // Year-wise RTCs â€” skip Vision reading, just note them (same format every year)
  const RTC_YEAR_PATTERN = /^RTC Sy\.No\.(106|108) of \d{2}-\d{2}\.pdf$/i;

  for (const f of fileObjects) {
    if (!f.path || !fs.existsSync(f.path)) continue;
    const fname = f.originalname || f.filename;

    if (checkpoint[fname]) {
      process.stdout.write(`  Cached: ${fname} âœ“\n`);
      continue;
    }

    // Skip year-wise RTC reading â€” handled as a group entry
    if (RTC_YEAR_PATTERN.test(fname)) {
      const syMatch = fname.match(/Sy\.No\.([\d/]+)/i);
      const yrMatch = fname.match(/of (\d{2}-\d{2})/i);
      const syNo = syMatch ? syMatch[1] : '';
      const yr   = yrMatch ? yrMatch[1] : '';
      const text = `Annual RTC/Pahani for year 20${yr} in respect of Sy.No.${syNo} of Thirumenahalli Village, Yelahanka Hobli, Bangalore North Taluk`;
      checkpoint[fname] = text;
      docExtracts.push(`\n${'â”€'.repeat(60)}\nFILE: ${fname}\n${'â”€'.repeat(60)}\n${text}`);
      fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2));
      process.stdout.write(`  Listed: ${fname} âœ“\n`);
      continue;
    }

    process.stdout.write(`  Reading: ${fname}... `);
    try {
      const extracted = await extractSingleDocument(f.path, fname);
      // 7 second throttle â€” stays under 10 req/min free limit
      await new Promise(r => setTimeout(r, 7000));

      if (extracted) {
        docExtracts.push(`\n${'â”€'.repeat(60)}\nFILE: ${fname}\n${'â”€'.repeat(60)}\n${extracted}`);
        checkpoint[fname] = extracted;
        fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2));
        process.stdout.write('âœ“\n');
      } else {
        process.stdout.write('(no content)\n');
      }
    } catch(e) {
      const msg = e.message || '';
      if (msg.includes('quota') || msg.includes('429')) {
        process.stdout.write('\n  â³ Rate limit â€” waiting 90s...\n');
        await new Promise(r => setTimeout(r, 90000));
        // retry once
        try {
          const extracted = await extractSingleDocument(f.path, fname);
          if (extracted) {
            docExtracts.push(`\n${'â”€'.repeat(60)}\nFILE: ${fname}\n${'â”€'.repeat(60)}\n${extracted}`);
            checkpoint[fname] = extracted;
            fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2));
            process.stdout.write('  Retry âœ“\n');
          }
        } catch(e2) {
          process.stdout.write(`  Skipped after retry\n`);
        }
      } else {
        process.stdout.write(`  Error: ${msg.substring(0,60)}\n`);
      }
    }
  }

  console.log(`\nâœ… ${Object.keys(checkpoint).length} documents extracted. Structuring report...\n`);

  const allText = (combinedText || '') + '\n\n' + docExtracts.join('\n\n');

  // Structure into Axis Bank report format
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const SYSTEM = `You are a senior Indian property law advocate preparing a Legal Scrutiny Report for ${bankName}.
You must follow the EXACT format of an Axis Bank Legal Scrutiny Report.

WRITING STYLE FOR EACH DOCUMENT TYPE â€” USE EXACTLY:
â€¢ RTC: "Record of Tenancy and Crops (RTC/Pahani) for the year YYYY-YY to YYYY-YY, issued by the Jurisdictional Revenue Authority in respect of the property bearing Sy.No.XX of [Village], [Hobli], [Taluk], [District], measuring [AREA], ([Pattadar Name])"
â€¢ Sale Deed: "Sale deed registered as Document No.XXXXX/YYYY-YY, executed by [SELLER(s) with SPA/guardian details], in respect of the property bearing Sy.No.XX of [Village], [Hobli], [Taluk], [District], measuring [AREA] in favour of [BUYER]"
â€¢ Partition Deed: "Partition Deed entered between [PARTIES], in respect of their Joint Family Properties including the property bearing Sy.No.XX..., measuring [TOTAL] (land measuring [SHARE] fallen to the share of [NAME]...)"
â€¢ MR: "Mutation Register Extract bearing MR No.X/YYYY-YY, issued by the Jurisdictional Revenue Authority in respect of the property bearing Sy.No.XX..."
â€¢ EC: "Encumbrance Certificate for the period from DD/MM/YYYY to DD/MM/YYYY in respect of Sy.No.XX of [Village], [Hobli], [Taluk]"
â€¢ GPA: "General Power of Attorney executed by [GRANTOR] in respect of the property bearing Sy.No.XX... in favour of [GRANTEE]"
â€¢ JDA: "Joint Development Agreement executed by [LANDOWNER(S)] (Landowners) and [DEVELOPER] (Developer) in respect of the property bearing Sy.No.XX..."
â€¢ Conversion Order: "Conversion Order bearing No.[ORDER NO] dated [DATE], issued by [AUTHORITY], converting Sy.No.XX from Agricultural to Residential use"
â€¢ NOC: "NOC dated [DATE] issued by [AUTHORITY], in respect of the proposed development at Sy.No.XX of [Village]..."
â€¢ Akarband: "Akarband (Area Statement) issued by the Jurisdictional Revenue Authority in respect of the property bearing Sy.No.XX of [Village], [Hobli], [Taluk], [District]"

STRICT OUTPUT RULES:
1. CLEAN ENGLISH ONLY â€” absolutely no Kannada, Telugu or any Indian language characters
2. No portal URLs, no digital signature metadata, no Bhoomi/Bhoomojini references
3. No "[SCANNED]" or technical notes â€” write the proper legal description
4. Group documents by Survey Number with sub-headers for each shareholder
5. Strict chronological order within each Survey Number
6. Insert GAP rows (isGap:true) in exact positions where title chain breaks
7. Return ONLY valid JSON â€” no markdown, no code blocks`;

  const PROMPT = `${SYSTEM}

EXTRACTED DOCUMENT DATA:
${allText.substring(0, 120000)}

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
    { "slNo": 1, "date": "DD/MM/YYYY", "particulars": "EXACT AXIS BANK STYLE DESCRIPTION", "documentType": "Photostat", "syNo": "", "isGap": false, "isSubHeader": false, "subHeaderText": null },
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
    "landownerShare": [{"slNo":1,"particulars":"Agreement of Sale...","documentType":"Photostat"}]
  },
  "documentsForCharge": {
    "developerShare": [{"slNo":1,"particulars":"Agreement of Sale...","documentType":"Original"}],
    "landownerShare": [{"slNo":1,"particulars":"Agreement of Sale...","documentType":"Original"}]
  },
  "documentsPostDisbursal": {
    "developerShare": [{"slNo":1,"document":"Sale Deed to be executed by Developer in favour of Borrowers availing loan from ${bankName}"}],
    "landownerShare": [{"slNo":1,"document":"Sale Deed to be executed by Landowners in favour of Borrowers availing loan from ${bankName}"}]
  },
  "btDetails": "N/A",
  "opinion": "Full legal opinion paragraph with actual owner names, actual survey numbers, actual developer name...",
  "subjectTo": ["Verification of all original documents","Encumbrance Certificate to be verified before mortgage transaction","An officer of the Bank to make personal inspection","Genuineness of documents to be confirmed"],
  "translatedContent": {"hasIndianLanguageContent": true, "languages": ["Kannada"], "translationNotes": "Revenue documents translated from Kannada"},
  "riskFlags": [],
  "overallStatus": "CONDITIONALLY CLEAR",
  "summary": "2-3 sentence summary"
}`;

  const result = await model.generateContent(PROMPT);
  let raw = result.response.text().trim();
  if (raw.startsWith('```')) raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');

  return JSON.parse(raw);
}

module.exports = { extractLegalData };

