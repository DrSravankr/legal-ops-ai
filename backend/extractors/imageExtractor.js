// Image text extraction — returns placeholder; actual OCR done by Gemini Vision in analyzer
async function extractTextFromImage(filePath) {
  try {
    // Return empty string — Gemini Vision will read the actual image in the analyze step
    return '';
  } catch (error) {
    return '';
  }
}

module.exports = { extractTextFromImage };
