import fs from 'fs';
import { openPdf, Reader } from './open';

import { PDFDocument } from 'src/index';

(async () => {
  const pdfDoc = await PDFDocument.create();

  const page = pdfDoc.addPage();

  page.drawText('Hello, world!');

  const pdfBytes = await pdfDoc.save();

  fs.writeFileSync('./out.pdf', pdfBytes);

  openPdf('./out.pdf', Reader.Preview);
})();
