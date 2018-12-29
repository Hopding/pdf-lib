const fs = require('fs');
const {
  PDFDocumentFactory,
  PDFDocumentWriter,
  StandardFonts,
  drawLinesOfText,
  drawImage,
  drawRectangle,
} = require('pdf-lib');

/* ========================= 1. Read in Assets ============================== */
// This step is platform dependent. Since this is a Node script, we can just
// read the assets in from the file system. But this approach wouldn't work
// in a browser. Instead, you might need to make HTTP requests for the assets.
const assets = {
  ubuntuFontBytes: fs.readFileSync('./assets/ubuntu-fonts/Ubuntu-R.ttf'),
  marioPngBytes: fs.readFileSync('./assets/running_mario.png'),
  taxVoucherPdfBytes: fs.readFileSync('./assets/income_tax_voucher.pdf'),
};

/* ================== 2. Load and Setup the PDF Document ==================== */
// This step is platform independent. The same code can be used in any
// JavaScript runtime (e.g. Node, the browser, or React Native).

// Here we load the tax voucher PDF file into a PDFDocument object.
const pdfDoc = PDFDocumentFactory.load(assets.taxVoucherPdfBytes);

// Let's define some constants that we can use to reference the fonts and
// images later in the script.
const COURIER_FONT = 'Courier';
const UBUNTU_FONT = 'Ubuntu';
const MARIO_PNG = 'MarioPng';

// Now we embed a standard font (Courier), and the custom TrueType font we
// read in (Ubuntu-R).
const [courierRef, courierFont] = pdfDoc.embedStandardFont(
  StandardFonts.Courier,
);
const [ubuntuRef, ubuntuFont] = pdfDoc.embedNonstandardFont(
  assets.ubuntuFontBytes,
);

// Next, we embed the PNG image we read in.
const [marioPngRef, marioPngDims] = pdfDoc.embedPNG(assets.marioPngBytes);

/* ====================== 3. Modify Existing Page =========================== */
// This step is platform independent. The same code can be used in any
// JavaScript runtime (e.g. Node, the browser, or React Native).

// Here we get an array of PDFPage objects contained in the `pdfDoc`. In this
// case, the tax voucher we loaded has a single page. So this will be an array
// of length one.
const pages = pdfDoc.getPages();

// Now we'll add the Courier font dictionary and Mario PNG image object that we
// embedded into the document earlier.
const existingPage = pages[0]
  .addFontDictionary(COURIER_FONT, courierRef)
  .addImageObject(MARIO_PNG, marioPngRef);

// Let's define some constants for the PNG image's width and height. We'll use
// the dimensions returned as the second element of the tuple returned by
// `pdfDoc.embedPNG` when we embedded the image in the document.
//
// Since the image is quite large relative to our page size, we'll scale both
// the width and height down to 15% of their original size.
const MARIO_PNG_WIDTH = marioPngDims.width * 0.15;
const MARIO_PNG_HEIGHT = marioPngDims.height * 0.15;

// Here, we define a new "content stream" for the page. A content stream is
// simply a sequence of PDF operators that define what we want to draw on the
// page.
const newContentStream = pdfDoc.createContentStream(
  // `drawImage` is a "composite" PDF operator that lets us easily draw an image
  // on a page's content stream. "composite" just means that it is composed of
  // several lower-level PDF operators. Usually, you'll want to work with
  // composite operators - they make things a lot easier! The naming convention
  // for composite operators is "draw<thing_being_drawn>".
  //
  // Here we draw the image of Mario on the page's content stream. We'll draw
  // him centered horizontally in the top half of the page.
  drawImage(MARIO_PNG, {
    x: 200,
    y: 350,
    width: MARIO_PNG_WIDTH,
    height: MARIO_PNG_HEIGHT,
  }),
  // Now let's draw 2 lines of red Courier text near the bottom of the page.
  drawLinesOfText(
    ['This text was added', 'with JavaScript!'].map(courierFont.encodeText),
    {
      x: 30,
      y: 150,
      font: COURIER_FONT,
      size: 48,
      colorRgb: [1, 0, 0],
    },
  ),
);

// Here we (1) register the content stream to the PDF document, and (2) add the
// reference to the registered stream to the page's content streams.
existingPage.addContentStreams(pdfDoc.register(newContentStream));

/* ================= 4. Setup and Create New First Page ===================== */
// This step is platform independent. The same code can be used in any
// JavaScript runtime (e.g. Node, the browser, or React Native).
const page1 = pdfDoc
  .createPage([600, 250])
  .addFontDictionary(UBUNTU_FONT, ubuntuRef);

// Let's define some RGB colors. Note that these arrays are of the form:
//   [<red_intensity>, <green_intensity>, <blue_intensity>]
// where each color value must be in the range 0.0-1.0. Note that they should
// *not* be in the range 0-255 as they would be if you were writing CSS styles,
// which is why we are dividing each color component by 255.
const PURPLE = [119 / 255, 41 / 255, 83 / 255];
const ORANGE = [224 / 255, 90 / 255, 43 / 255];

const contentStream1 = pdfDoc.createContentStream(
  drawRectangle({
    width: 600,
    height: 250,
    colorRgb: PURPLE,
  }),
  drawLinesOfText(
    ['This is the new first page.', 'It was inserted with JavaScript!'].map(
      ubuntuFont.encodeText,
    ),
    {
      x: 30,
      y: 130,
      font: UBUNTU_FONT,
      size: 38,
      colorRgb: ORANGE,
    },
  ),
);

// Here we (1) register the content stream to the PDF document, and (2) add the
// reference to the registered stream as the page's content stream.
page1.addContentStreams(pdfDoc.register(contentStream1));

/* ================= 5. Setup and Create New Third Page ===================== */
// This step is platform independent. The same code can be used in any
// JavaScript runtime (e.g. Node, the browser, or React Native).
const page3 = pdfDoc
  .createPage([600, 250])
  .addFontDictionary(UBUNTU_FONT, ubuntuRef);

const contentStream3 = pdfDoc.createContentStream(
  drawRectangle({
    width: 600,
    height: 250,
    colorRgb: ORANGE,
  }),
  drawLinesOfText(
    ['This is the new last page.', 'It was inserted with JavaScript!'].map(
      ubuntuFont.encodeText,
    ),
    {
      x: 30,
      y: 130,
      font: UBUNTU_FONT,
      size: 38,
      colorRgb: PURPLE,
    },
  ),
);

// Here we (1) register the content stream to the PDF document, and (2) add the
// reference to the registered stream as the page's content stream.
page3.addContentStreams(pdfDoc.register(contentStream3));

/* =========== 6. Insert and Add Pages and Convert PDF to Bytes ============= */
// This step is platform independent. The same code can be used in any
// JavaScript runtime (e.g. Node, the browser, or React Native).

// Here we add the page's to the document. This step is what will cause the
// pages to actually be rendered when the document is opened. Our previous calls
// to `pdfDoc.createPage` only **created** the pages, they did not add them to
// the document.
pdfDoc.insertPage(0, page1).addPage(page3);

// Now we'll convert the `pdfDoc` to a `Uint8Array` containing the bytes of a
// PDF document. This step serializes the document. You can still make changes
// to the document after this step, but you'll have to call `saveToBytes` again
// after doing so.
//
// The `Uint8Array` returned here can be used in a number of ways. What you do
// with it largely depends on the JavaScript environment you're running in.
const pdfBytes = PDFDocumentWriter.saveToBytes(pdfDoc);

/* ========================== 7. Write PDF to File ========================== */
// This step is platform dependent. Since this is a Node script, we can just
// save the `pdfBytes` to the file system, where it can be opened with a PDF
// reader.
const filePath = `${__dirname}/modified.pdf`;
fs.writeFileSync(filePath, pdfBytes);
console.log(`PDF file written to: ${filePath}`);
