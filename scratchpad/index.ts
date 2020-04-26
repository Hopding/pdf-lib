import fs from 'fs';
import { openPdf, Reader } from './open';

import { PDFDocument } from 'src/index';

(async () => {
  const pdfDoc = await PDFDocument.create();

  const page = pdfDoc.addPage();

  const img = await pdfDoc.embedJpg(
    fs.readFileSync('assets/images/cmyk_colorspace.jpg'),
  );

  page.drawImage(img);

  const pdfBytes = await pdfDoc.save();

  fs.writeFileSync('./out.pdf', pdfBytes);

  openPdf('./out.pdf', Reader.Preview);
})();
