const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Minimum chars before we consider PDF text-extracted (not scanned)
const MIN_TEXT_CHARS = 100;

async function extractTextFromPdf(filePath, useVisionFallback = true) {
  let text = '';

  try {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer, { max: 20 });
    text = data.text.trim().replace(/\n{4,}/g, '\n\n').replace(/[ \t]{3,}/g, '  ');
  } catch (e) {
    // pdf-parse failed entirely — will try vision
  }

  // If text is sparse (scanned PDF), use Claude Vision on the PDF bytes
  if (text.length < MIN_TEXT_CHARS && useVisionFallback && process.env.ANTHROPIC_API_KEY) {
    try {
      text = await extractFromScannedPdf(filePath);
    } catch (visionErr) {
      console.warn(`Vision fallback failed for ${path.basename(filePath)}: ${visionErr.message}`);
    }
  }

  return text;
}

async function extractFromScannedPdf(filePath) {
  const buffer = fs.readFileSync(filePath);
  const base64 = buffer.toString('base64');
  const filename = path.basename(filePath).toLowerCase();

  const prompt = `This is a scanned Indian legal/property document (likely in English, Kannada, Telugu, or Hindi).
Extract ALL text visible in this document. For text in Indian languages (Kannada/Telugu/Hindi/Tamil/Malayalam),
translate to English and extract the key information.

Focus on extracting:
- Document type (Sale Deed / RTC / Mutation Register / Encumbrance Certificate / GPA / JDA / Conversion Order / NOC / etc.)
- Survey numbers (Sy.No.), village names, hobli, taluk, district
- Names of parties (owners, buyers, sellers, attorneys)
- Dates and document registration numbers
- Land measurements (acres, guntas, sq.ft)
- Any encumbrances, mortgages, or charges
- Government order/approval numbers
- Any Kannada revenue record data (pahani, tippani, akarband entries)

Return the extracted text in structured format.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: [{
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: base64
        }
      }, {
        type: 'text',
        text: prompt
      }]
    }]
  });

  return `[Claude Vision OCR]\n${response.content[0].text}`;
}

module.exports = { extractTextFromPdf };
