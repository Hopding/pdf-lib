import fs from 'fs';
import { openPdf, Reader } from './open';

import { PDFDocument, rgb } from 'src/index';

(async () => {
  const pdfDoc = await PDFDocument.create();

  const page = pdfDoc.addPage();
  page.drawText('Semi-Transparent Text', {
    color: rgb(0, 1, 1),
    opacity: 0.5,
    size: 50,
  });

  const pdfBytes = await pdfDoc.save();

  fs.writeFileSync('./out.pdf', pdfBytes);

  openPdf('./out.pdf', Reader.Preview);
})();
