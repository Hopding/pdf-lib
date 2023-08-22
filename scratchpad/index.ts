import fs from 'fs';
import { openPdf, Reader } from './open';
import { PDFDocument } from 'src/index';

(async () => {
  // Case 1 - Using StreamWriter
  const existingPdfBytes = fs.readFileSync('assets/pdfs/sample_form.pdf');
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const page = pdfDoc.addPage();
  page.drawText('Creating PDFs in JavaScript is awesome!', {
    x: 100,
    y: 100,
  });

  await pdfDoc.encrypt({
    userPassword: 'abcd',
    permissions: { modifying: true },
  });

  // const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  // fs.writeFileSync('out.pdf', pdfBytes);
  // openPdf('out.pdf', Reader.Preview);

  // Case 2 - Using PDFWriter
  // const existingPdfBytes = fs.readFileSync('assets/pdfs/sample_form.pdf');
  // const pdfDoc = await PDFDocument.load(existingPdfBytes);

  // const pdfDoc = await PDFDocument.create();
  // const existingPdfBytes = fs.readFileSync('test.pdf');
  // const pdfDoc = await PDFDocument.load(existingPdfBytes);
  // const page = pdfDoc.addPage();
  // page.drawText('Creating PDFs in JavaScript is awesome!', {
  //   x: 50,
  //   y: 700,
  // });

  // pdfDoc.encrypt({
  //   userPassword: 'abcd',
  //   ownerPassword: '1234',
  //   permissions: { modifying: true },
  // });


  // const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
  // fs.writeFileSync('simple0.pdf', pdfBytes);
  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  fs.writeFileSync('simplexx.pdf', pdfBytes);
  openPdf('out.pdf', Reader.Preview);
})();
