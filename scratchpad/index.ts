import fs from 'fs';
import { openPdf, Reader } from './open';

import { PDFDocument } from 'src/index';

(async () => {
  const pdfDoc = await PDFDocument.create();

  const smallMario = await pdfDoc.embedPng(
    // fs.readFileSync('assets/images/small_mario.png'),
    fs.readFileSync('assets/images/greyscale_bird.png'),
  );
  const dims = smallMario.scale(1);

  const page = pdfDoc.addPage();

  page.drawImage(smallMario, {
    ...dims,
    x: page.getWidth() / 2 - dims.width / 2,
    y: page.getHeight() / 2 - dims.height / 2,
  });

  const pdfBytes = await pdfDoc.save();

  fs.writeFileSync('./out.pdf', pdfBytes);

  openPdf('./out.pdf', Reader.Preview);
})();
