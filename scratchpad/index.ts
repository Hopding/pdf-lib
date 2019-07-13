import fs from 'fs';
import { grayscale, PDFDocument } from 'src/index';
import { openPdf, Reader } from './open';

(async () => {
  const pdfDoc = await PDFDocument.create();

  grayscale(21);

  pdfDoc.addPage();

  const pdfBytes = await pdfDoc.save({ useObjectStreams: 'foo' } as any);

  fs.writeFileSync('./out.pdf', pdfBytes);

  openPdf('./out.pdf', Reader.Preview);
})();
