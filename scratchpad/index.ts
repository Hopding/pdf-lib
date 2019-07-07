import fs from 'fs';
import { PDFDocument, rgb } from 'src/index';
import { openPdf, Reader } from './open';

(async () => {
  const pdfDoc = await PDFDocument.load(
    fs.readFileSync('assets/pdfs/normal.pdf'),
  );

  const [page] = pdfDoc.getPages();

  const { width, height } = page.getSize();

  page.setSize(width + 100, height + 100);

  page.translateContent(100, 100);

  page.drawText('Stuff and things', { color: rgb(1, 0, 0), size: 75 });

  page.resetPosition();

  page.drawText('Stuff and things', { color: rgb(1, 0, 0), size: 75 });

  const pdfBytes = await pdfDoc.save();

  fs.writeFileSync('./out.pdf', pdfBytes);
  console.log('./out.pdf');

  openPdf('./out.pdf', Reader.Preview);
})();
