import fs from 'fs';
import { openPdf, Reader } from './open';

import { PDFDocument } from 'src/index';

(async () => {
  const pdfDoc = await PDFDocument.load(
    fs.readFileSync('assets/pdfs/normal.pdf'),
  );

  console.log('Count:', pdfDoc.getPageCount());
  pdfDoc.removePage(1);

  const pdfBytes = await pdfDoc.save();

  fs.writeFileSync('./out.pdf', pdfBytes);

  openPdf('./out.pdf', Reader.Preview);
})();
