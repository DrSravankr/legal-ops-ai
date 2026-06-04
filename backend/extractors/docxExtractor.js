const mammoth = require('mammoth');
const fs = require('fs');

async function extractTextFromDocx(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  } catch (error) {
    throw new Error(`DOCX extraction failed: ${error.message}`);
  }
}

module.exports = { extractTextFromDocx };
