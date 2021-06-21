import fs from 'fs';
import { openPdf, Reader } from './open';
import { PDFDocument } from 'src/index';

(async () => {
  // const pdfDoc = await PDFDocument.create({
  //   encryptOption: {
  //     userPassword: 'abcd',
  //     // permissions: { modifying: true },
  //   },
  // });

  const existingPdfBytes = fs.readFileSync('assets/pdfs/sample_form.pdf');

  // Load a PDFDocument without updating its existing metadata
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  await pdfDoc.encrypt({
    encryptOption: {
      userPassword: 'abcd',
      // permissions: { modifying: true },
    },
  });

  const pdfBytes = await pdfDoc.save({ useObjectStreams: false });

  fs.writeFileSync('out.pdf', pdfBytes);
  openPdf('out.pdf', Reader.Preview);
})();
