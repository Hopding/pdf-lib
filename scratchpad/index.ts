import fs from 'fs';
import { openPdf, Reader } from './open';
import { PDFDocument } from 'src/index';

(async () => {
  const existingPdfBytes = fs.readFileSync('assets/pdfs/sample_form.pdf');

  // Load a PDFDocument without updating its existing metadata
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  // const pdfDoc = await PDFDocument.create();

  await pdfDoc.encrypt({
    userPassword: 'abcd',
    permissions: { modifying: true },
  });

  const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
  // const pdfBytes = await pdfDoc.save({ useObjectStreams: true });

  fs.writeFileSync('out2.pdf', pdfBytes);
  openPdf('out.pdf', Reader.Preview);
})();
