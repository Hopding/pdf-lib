const fs = require('fs');
const {
  PDFDocumentFactory,
  PDFDocumentWriter,
  drawText,
  drawLinesOfText,
  drawRectangle,
  drawEllipse,
  drawImage,
} = require('pdf-lib');

/* ==================== 1. Read in Fonts and Images ========================= */
// This step is platform dependent. Since this is a Node script, we can just
// read the assets in from the file system. But this approach wouldn't work
// in a browser. Instead, you might need to make HTTP requests for the assets.
const assets = {
  ubuntuFontBytes: fs.readFileSync('./assets/ubuntu-fonts/Ubuntu-R.ttf'),
  unicornJpgBytes: fs.readFileSync('./assets/cat_riding_unicorn.jpg'),
  marioPngBytes: fs.readFileSync('./assets/running_mario.png'),
};

/* ================ 2. Create and Setup the PDF Document ==================== */
// This step is platform independent. The same code can be used in any
// JavaScript runtime (e.g. Node, the browser, or React Native).

// Here we create a new PDF document.
const pdfDoc = PDFDocumentFactory.create();

// Let's define some constants that we can use to reference the fonts and
// images later in the script.
const HELVETIVA_FONT = 'Helvetica';
const UBUNTU_FONT = 'Ubuntu';
const UNICORN_JPG = 'UnicornJpg';
const MARIO_PNG = 'MarioPng';

// Now we embed a standard font (Helvetiva), and the custom TrueType font we
// read in (Ubuntu-R).
const [helveticaFontRef, helveticaFont] = pdfDoc.embedStandardFont(HELVETIVA_FONT);
const [ubuntuFontRef] = pdfDoc.embedFont(assets.ubuntuFontBytes);

// Next, we embed the JPG and PNG images we read in.
const [unicornJpgRef, unicornJpgDims] = pdfDoc.embedJPG(assets.unicornJpgBytes);
const [marioPngRef, marioPngDims] = pdfDoc.embedPNG(assets.marioPngBytes);

/* =================== 3. Setup and Create First Page ======================= */
// This step is platform independent. The same code can be used in any
// JavaScript runtime (e.g. Node, the browser, or React Native).

// Let's define some constants containing the page's width and height.
const PAGE_1_WIDTH = 600;
const PAGE_1_HEIGHT = 750;

// Next we create a page, and add the Helvetiva font and JPG image to it. This
// allows us to use the font and image in the page's content stream.
const page1 = pdfDoc
  .createPage([PAGE_1_WIDTH, PAGE_1_HEIGHT])
  .addFontDictionary(HELVETIVA_FONT, helveticaFontRef)
  .addImageObject(UNICORN_JPG, unicornJpgRef);

// Let's define some constants for the JPG image's width and height. We'll use
// the dimensions returned as the second element of the tuple returned by
// `pdfDoc.embedJPG` when we embedded the image in the document.
//
// Since the image is quite large relative to our page size, we'll scale both
// the width and height down to 20% of their original size.
const UNICORN_JPG_WIDTH = unicornJpgDims.width * 0.2;
const UNICORN_JPG_HEIGHT = unicornJpgDims.height * 0.2;

// Let's define some RGB colors. Note that these arrays are of the form:
//   [<red_intensity>, <green_intensity>, <blue_intensity>]
// where each color value must be in the range 0.0-1.0. Note that they should
// *not* be in the range 0-255 as they would be if you were writing CSS styles.
const CYAN = [0.25, 1.0, 0.79];
const PURPLE = [0.79, 0.25, 1.0];

// Here, we define the first page's "content stream". A content stream is simply
// a sequence of PDF operators that define what we want to draw on the page.
const contentStream1 = pdfDoc.createContentStream(
  // `drawText` is a "composite" PDF operator that lets us easily draw text on
  // a page's content stream. "composite" just means that it is composed of
  // several lower-level PDF operators. Usually, you'll want to work with
  // composite operators - they make things a lot easier! The naming convention
  // for composite operators is "draw<thing_being_drawn>".
  drawText('This PDF was Created with JavaScript!', {
    x: 85,
    y: PAGE_1_HEIGHT - 48,
    font: HELVETIVA_FONT,
    size: 24,
  }),
  drawText(helveticaFont.encodeText('Olé! - Œ'), {
    x: PAGE_1_WIDTH * 0.5 -  30,
    y: PAGE_1_HEIGHT - 48 - 30,
    font: HELVETIVA_FONT,
    size: 12,
  }),
  // Now we'll draw the Unicorn image on the page's content stream. We'll
  // position it a little bit below the text we just drew, and we'll center it
  // within the page.
  drawImage(UNICORN_JPG, {
    x: PAGE_1_WIDTH * 0.5 - UNICORN_JPG_WIDTH * 0.5,
    y: PAGE_1_HEIGHT * 0.5,
    width: UNICORN_JPG_WIDTH,
    height: UNICORN_JPG_HEIGHT,
  }),
  // Finally, let's draw an ellipse on the page's content stream. We'll draw it
  // below the image we just drew, and we'll center it within the page. We'll
  // color it cyan, with a purple border.
  drawEllipse({
    x: PAGE_1_WIDTH * 0.5,
    y: PAGE_1_HEIGHT * 0.2,
    xScale: 150,
    yScale: 50,
    borderWidth: 15,
    colorRgb: CYAN,
    borderColorRgb: PURPLE,
  }),
);

// Here we (1) register the content stream to the PDF document, and (2) add the
// reference to the registered stream as the page's content stream.
page1.addContentStreams(pdfDoc.register(contentStream1));

/* =================== 4. Setup and Create Second Page ====================== */
// This step is platform independent. The same code can be used in any
// JavaScript runtime (e.g. Node, the browser, or React Native).

// Let's define some constants containing the second page's width and height.
const PAGE_2_WIDTH = 600;
const PAGE_2_HEIGHT = 750;

// Next we create another page, and add the Ubuntu font and PNG image to it.
// This allows us to use the font and image in the page's content stream.
const page2 = pdfDoc
  .createPage([PAGE_2_WIDTH, PAGE_2_HEIGHT])
  .addFontDictionary(UBUNTU_FONT, ubuntuFontRef)
  .addImageObject(MARIO_PNG, marioPngRef);

// Let's define some constants for the PNG image's width and height. We'll use
// the dimensions returned as the second element of the tuple returned by
// `pdfDoc.embedPNG` when we embedded the image in the document.
//
// Since the image is quite large relative to our page size, we'll scale both
// the width and height down to 15% of their original size.
const MARIO_PNG_WIDTH = marioPngDims.width * 0.15;
const MARIO_PNG_HEIGHT = marioPngDims.height * 0.15;

// Let's define a constant containing the width of the text box we'll place
// below the image of Mario.
const TEXT_BOX_WIDTH = 295;

// Let's define some RGB colors. Note that these arrays are of the form:
//   [<red_intensity>, <green_intensity>, <blue_intensity>]
// where each color value must be in the range 0.0-1.0. Note that they should
// *not* be in the range 0-255 as they would be if you were writing CSS styles.
const SOLARIZED_WHITE = [253 / 255, 246 / 255, 227 / 255];
const SOLARIZED_GRAY = [101 / 255, 123 / 255, 131 / 255];

// Here, we define the second page's "content stream". A content stream is
// simply a sequence of PDF operators that define what we want to draw on the
// page.
const contentStream2 = pdfDoc.createContentStream(
  // Here we draw the image of Mario on the page's content stream. We'll draw
  // him centered horizontally in the top half of the page.
  drawImage(MARIO_PNG, {
    x: PAGE_2_WIDTH * 0.5 - MARIO_PNG_WIDTH * 0.5,
    y: PAGE_2_HEIGHT * 0.5,
    width: MARIO_PNG_WIDTH,
    height: MARIO_PNG_HEIGHT,
  }),
  // Next we'll draw a Solarized White rectangle with a Solarized Gray border
  // beneath the image of Mario. It will be centered horizontally in the page.
  drawRectangle({
    x: PAGE_2_WIDTH * 0.5 - TEXT_BOX_WIDTH * 0.5,
    y: PAGE_2_HEIGHT * 0.5 - 100,
    width: TEXT_BOX_WIDTH,
    height: 90,
    colorRgb: SOLARIZED_WHITE,
    borderWidth: 4,
    borderColorRgb: SOLARIZED_GRAY,
  }),
  // Now we'll draw three lines of text within the rectangle we just drew. The
  // text will be drawn in the Ubuntu font colored Solarized Gray.
  drawLinesOfText(
    [
      'Here is a picture of Mario',
      'running. It was placed in',
      'this PDF using JavaScript!',
    ],
    {
      x: PAGE_2_WIDTH * 0.5 - TEXT_BOX_WIDTH * 0.5 + 10,
      y: PAGE_2_HEIGHT * 0.5 - 38,
      font: UBUNTU_FONT,
      size: 24,
      colorRgb: SOLARIZED_GRAY,
    },
  ),
);

// Here we (1) register the content stream to the PDF document, and (2) add the
// reference to the registered stream as the page's content stream.
page2.addContentStreams(pdfDoc.register(contentStream2));

/* ================= 5. Add Pages and Convert PDF to Bytes ================== */
// This step is platform independent. The same code can be used in any
// JavaScript runtime (e.g. Node, the browser, or React Native).

// Here we add the page's to the document. This step is what will cause the
// pages to actually be rendered when the document is opened. Our previous calls
// to `pdfDoc.createPage` only **created** the pages, they did not add them to
// the document.
pdfDoc.addPage(page1).addPage(page2);

// Now we'll convert the `pdfDoc` to a `Uint8Array` containing the bytes of a
// PDF document. This step serializes the document. You can still make changes
// to the document after this step, but you'll have to call `saveToBytes` again
// after doing so.
//
// The `Uint8Array` returned here can be used in a number of ways. What you do
// with it largely depends on the JavaScript environment you're running in.
const pdfBytes = PDFDocumentWriter.saveToBytes(pdfDoc);

/* ========================== 6. Write PDF to File ========================== */
// This step is platform dependent. Since this is a Node script, we can just
// save the `pdfBytes` to the file system, where it can be opened with a PDF
// reader.
const filePath = `${__dirname}/new.pdf`;
fs.writeFileSync(filePath, pdfBytes);
console.log(`PDF file written to: ${filePath}`);
