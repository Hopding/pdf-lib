import fs from 'fs';
import { openPdf, Reader } from './open';

import { PDFDocument, rgb } from 'src/index';

(async () => {
  const pdfDoc = await PDFDocument.load(
    fs.readFileSync('assets/pdfs/with_cropbox.pdf'),
  );

  const page = pdfDoc.getPage(0);
  const { width, height } = page.getSize();

  page.setWidth(width + 50);
  page.setHeight(height + 50);
  page.drawRectangle({ x: width, width: 50, height, color: rgb(1, 0, 0) });
  page.drawRectangle({ y: height, height: 50, width, color: rgb(0, 1, 0) });

  const pdfBytes = await pdfDoc.save();

  fs.writeFileSync('./out.pdf', pdfBytes);

  openPdf('./out.pdf', Reader.Preview);
})();
