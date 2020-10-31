import fs from 'fs';
import { openPdf, Reader } from './open';
import { PDFDocument } from 'src/index';

(async () => {
  const pdfDoc = await PDFDocument.load(
    fs.readFileSync('19_StatusReport-Modified.pdf'),
  );

  const page = pdfDoc.getPage(0);
  page.drawText('Foo Bar');

  const pdfBytes = await pdfDoc.save();

  fs.writeFileSync('out.pdf', pdfBytes);
  openPdf('out.pdf', Reader.Preview);
})();
