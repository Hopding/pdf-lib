const fs = require('fs');
const {
  PDFDocumentFactory,
  PDFDocumentWriter,
  StandardFonts,
  drawText,
  drawRectangle,
} = require('pdf-lib');

/* ========================= 1. Read in Assets ============================== */
// This step is platform dependent. Since this is a Node script, we can just
// read the assets in from the file system. But this approach wouldn't work
// in a browser. Instead, you might need to make HTTP requests for the assets.
const assets = {
  ubuntuFontBytes: fs.readFileSync('./assets/ubuntu-fonts/Ubuntu-R.ttf'),
};

/* ================= 2. Create and Setup the PDF Document =================== */
// Here we create a PDFDocument object.
const pdfDoc = PDFDocumentFactory.create();

// Let's define some constants that we can use to reference the fonts later on.
const HELVETICA = 'Helvetica';
const UBUNTU = 'Ubuntu';
const ZAPF_DINGBATS = 'ZapfDingbats';
const SYMBOL = 'SYMBOL';

// Now we embed 3 standard font (Helvetica, ZapfDingbats, Symbol), and the
// custom TrueType font we read in (Ubuntu).
const [helveticaRef, helveticaFont] = pdfDoc.embedStandardFont(
  StandardFonts.Helvetica,
);
const [ubuntuRef, ubuntuFont] = pdfDoc.embedNonstandardFont(
  assets.ubuntuFontBytes,
);
const [zapfDingbatsRef, zapfDingbatsFont] = pdfDoc.embedStandardFont(
  StandardFonts.ZapfDingbats,
);
const [symbolRef, symbolFont] = pdfDoc.embedStandardFont(StandardFonts.Symbol);

/* ============== 3. Define and Measure Text (for each font) ================ */
// Helvetica
const helveticaText = 'Æ × Ø I Ð ¡ ¢ £ ¤ ¥ ¦ § © „ †‡ • ... ‰ ‹ › € TM';
const helveticaSize = 25;
const helveticaWidth = helveticaFont.widthOfTextAtSize(
  helveticaText,
  helveticaSize,
);
const helveticaHeight = helveticaFont.heightOfFontAtSize(helveticaSize);

// Ubuntu
const ubuntuText = 'Lorem ипсум δολορ';
const ubuntuSize = 35;
const ubuntuWidth = ubuntuFont.widthOfTextAtSize(ubuntuText, ubuntuSize);
const ubuntuHeight = ubuntuFont.heightOfFontAtSize(ubuntuSize);

// ZapfDingbats
const zapfDingbatsText = '↔ ❼ ☎ ✂ ✈ ❁ ❂ ❒ ➔ ➬ ➵ ➾';
const zapfDingbatsSize = 40;
const zapfDingbatsWidth = zapfDingbatsFont.widthOfTextAtSize(
  zapfDingbatsText,
  zapfDingbatsSize,
);
const zapfDingbatsHeight = zapfDingbatsFont.heightOfFontAtSize(
  zapfDingbatsSize,
);

// Symbol
const symbolText = '± × ÷ + − ƒ μ α β γ δ θ ∏ ∑ ∫ ∴ { | }';
const symbolSize = 40;
const symbolWidth = symbolFont.widthOfTextAtSize(symbolText, symbolSize);
const symbolHeight = symbolFont.heightOfFontAtSize(symbolSize);

/* ================= 4. Draw Text with Borders Around It ==================== */
const PAGE_WIDTH = 650;
const PAGE_HEIGHT = 700;

// Here we create a content stream that we'll later apply to a PDFPage.
// We'll draw each string of text that we defined with the `drawText` operator.
// And we'll draw a border around each string of text using the widths and
// heights we measured, and the `drawRectangle` operator.
const contentStream = pdfDoc.createContentStream(
  // Helvetica Text
  drawText(helveticaFont.encodeText(helveticaText), {
    font: HELVETICA,
    size: helveticaSize,
    x: 150,
    y: PAGE_HEIGHT - 200,
  }),
  // Helvetica Border
  drawRectangle({
    x: 150,
    y: PAGE_HEIGHT - 200,
    width: helveticaWidth,
    height: helveticaHeight,
    borderWidth: 1.0,
    borderColorRgb: [1.0, 0.2, 0.2],
  }),

  // Ubuntu Text
  drawText(ubuntuFont.encodeText(ubuntuText), {
    font: UBUNTU,
    size: ubuntuSize,
    x: 225,
    y: PAGE_HEIGHT - 300,
  }),
  // Ubuntu Border
  drawRectangle({
    x: 225,
    y: PAGE_HEIGHT - 300,
    width: ubuntuWidth,
    height: ubuntuHeight,
    borderWidth: 1.0,
    borderColorRgb: [1.0, 0.2, 0.2],
  }),

  // ZapfDingbats Text
  drawText(zapfDingbatsFont.encodeText(zapfDingbatsText), {
    font: ZAPF_DINGBATS,
    size: zapfDingbatsSize,
    x: 50,
    y: PAGE_HEIGHT - 400,
  }),
  // ZapfDingbats Border
  drawRectangle({
    x: 50,
    y: PAGE_HEIGHT - 400,
    width: zapfDingbatsWidth,
    height: zapfDingbatsHeight,
    borderWidth: 1.0,
    borderColorRgb: [1.0, 0.2, 0.2],
  }),

  // Symbol Text
  drawText(symbolFont.encodeText(symbolText), {
    font: SYMBOL,
    size: symbolSize,
    x: 25,
    y: PAGE_HEIGHT - 500,
  }),
  // Symbol Border
  drawRectangle({
    x: 25,
    y: PAGE_HEIGHT - 500,
    width: symbolWidth,
    height: symbolHeight,
    borderWidth: 1.0,
    borderColorRgb: [1.0, 0.2, 0.2],
  }),
);

/* ================ 5. Add Page with Content to Document ==================== */
const page = pdfDoc
  .createPage([PAGE_WIDTH, PAGE_HEIGHT])
  .addFontDictionary(HELVETICA, helveticaRef)
  .addFontDictionary(UBUNTU, ubuntuRef)
  .addFontDictionary(ZAPF_DINGBATS, zapfDingbatsRef)
  .addFontDictionary(SYMBOL, symbolRef)
  .addContentStreams(pdfDoc.register(contentStream));

pdfDoc.addPage(page);

/* ======================= 6. Convert PDF to Bytes ========================== */
// Now we'll convert the `pdfDoc` to a `Uint8Array` containing the bytes of a
// PDF document. This step serializes the document. You can still make changes
// to the document after this step, but you'll have to call `saveToBytes` again
// after doing so.
//
// The `Uint8Array` returned here can be used in a number of ways. What you do
// with it largely depends on the JavaScript environment you're running in.
const pdfBytes = PDFDocumentWriter.saveToBytes(pdfDoc);

/* ======================= 7. Write PDF to File ============================= */
// This step is platform dependent. Since this is a Node script, we can just
// save the `pdfBytes` to the file system, where it can be opened with a PDF
// reader.
const filePath = `${__dirname}/out.pdf`;
fs.writeFileSync(filePath, pdfBytes);
console.log(`PDF file written to: ${filePath}`);
