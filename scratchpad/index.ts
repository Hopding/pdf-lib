import fs from 'fs';
import fetch from 'node-fetch';
import { openPdf, Reader } from './open';

import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, rgb } from 'src/index';

async function embedImages() {
  const url = 'https://pdf-lib.js.org/assets/ubuntu/Ubuntu-R.ttf';
  const fontBytes = await fetch(url).then((res) => res.arrayBuffer());

  const pdfDoc = await PDFDocument.create();

  pdfDoc.registerFontkit(fontkit);
  const customFont = await pdfDoc.embedFont(fontBytes);

  const page = pdfDoc.addPage();

  const text = 'This is text in an embedded font!';
  const textSize = 35;
  const textWidth = customFont.widthOfTextAtSize(text, textSize);
  const textHeight = customFont.heightAtSize(textSize);

  page.drawText(text, {
    x: 40,
    y: 450,
    size: textSize,
    font: customFont,
    color: rgb(0, 0.53, 0.71),
  });
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

  openPdf('./out.pdf', Reader.Preview);
}

embedImages();
