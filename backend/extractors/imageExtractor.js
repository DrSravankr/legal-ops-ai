const Tesseract = require('tesseract.js');

// Indian language codes supported by Tesseract
// kan=Kannada, tel=Telugu, tam=Tamil, hin=Hindi, mal=Malayalam,
// mar=Marathi, guj=Gujarati, pan=Punjabi, ben=Bengali, ori=Odia
const INDIAN_LANG_PACK = 'eng+kan+tel+tam+hin+mal+mar+guj+pan+ben';

async function extractTextFromImage(filePath) {
  try {
    const worker = await Tesseract.createWorker(INDIAN_LANG_PACK, 1, {
      logger: () => {} // suppress logs
    });

    const { data: { text } } = await worker.recognize(filePath);
    await worker.terminate();

    return text.trim();
  } catch (error) {
    // Fallback to English-only if Indian language packs not available
    try {
      const worker = await Tesseract.createWorker('eng', 1, {
        logger: () => {}
      });
      const { data: { text } } = await worker.recognize(filePath);
      await worker.terminate();
      return text.trim();
    } catch (fallbackError) {
      throw new Error(`Image OCR failed: ${fallbackError.message}`);
    }
  }
}

module.exports = { extractTextFromImage };
