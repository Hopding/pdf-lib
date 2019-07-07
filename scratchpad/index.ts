import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import { PDFDocument, rgb } from 'src/index';
import { openPdf, Reader } from './open';

(async () => {
  // This should be a Uint8Array or ArrayBuffer
  // This data can be obtained in a number of different ways
  // If your running in a Node environment, you could use fs.readFile()
  // In the browser, you could make a fetch() call and use res.arrayBuffer()
  const fontBytes = fs.readFileSync('assets/fonts/ubuntu/Ubuntu-R.ttf');

  // Create a new PDFDocument
  const pdfDoc = await PDFDocument.create();

  // Register the `fontkit` instance
  pdfDoc.registerFontkit(fontkit);

  // Embed our custom font in the document
  const customFont = await pdfDoc.embedFont(fontBytes, { subset: true });

  // Add a blank page to the document
  const page = pdfDoc.addPage();

  // Create a string of text and measure its width and height in our custom font
  const text = 'This is text in an embedded font!';
  const textSize = 35;
  const textWidth = customFont.widthOfTextAtSize(text, textSize);
  const textHeight = customFont.heightAtSize(textSize);

  // Draw the string of text on the page
  page.drawText(text, {
    x: 40,
    y: 450,
    size: textSize,
    font: customFont,
    color: rgb(0, 0.53, 0.71),
  });

  // Draw a box around the string of text
  page.drawRectangle({
    x: 40,
    y: 450,
    width: textWidth,
    height: textHeight,
    borderColor: rgb(1, 0, 0),
    borderWidth: 1.5,
  });

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();

  // For example, `pdfBytes` can be:
  //   • Written to a file in Node
  //   • Downloaded from the browser
  //   • Rendered in an <iframe>

  fs.writeFileSync('./out.pdf', pdfBytes);
  console.log('./out.pdf');

  openPdf('./out.pdf', Reader.Acrobat);
})();
