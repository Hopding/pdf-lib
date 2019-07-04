import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import { PDFDocument, rgb } from 'src/index';

(async () => {
  // This should be a Uint8Array.
  // This data can be obtained in a number of different ways.
  // If your running in a Node environment, you could use fs.readFile().
  // In the browser, you could make a fetch() call and use res.arrayBuffer().
  const fontBytes = fs.readFileSync('assets/fonts/ubuntu/Ubuntu-R.ttf');

  const pdfDoc = await PDFDocument.create();

  pdfDoc.registerFontkit(fontkit);

  const customFont = await pdfDoc.embedFont(fontBytes, { subset: true });

  const page = pdfDoc.addPage();

  const text = 'This is text in an embedded font!';
  const textSize = 35;
  const textWidth = customFont.widthOfTextAtSize(text, textSize);
  const textHeight = customFont.heightAtSize(textSize);

  // Draw text on page
  page.drawText(text, {
    x: 40,
    y: 450,
    size: textSize,
    font: customFont,
    color: rgb(0, 0.53, 0.71),
  });

  // Draw a box around the text
  page.drawRectangle({
    x: 40,
    y: 450,
    width: textWidth,
    height: textHeight,
    borderColor: rgb(1, 0, 0),
    borderWidth: 1.5,
  });

  const pdfBytes = await pdfDoc.save();

  fs.writeFileSync('./out.pdf', pdfBytes);
  console.log('./out.pdf');
})();
