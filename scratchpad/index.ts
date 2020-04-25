import fs from 'fs';
import { openPdf, Reader } from './open';

import { PDFDocument } from 'src/index';

(async () => {
  const pdfDoc = await PDFDocument.load(
    fs.readFileSync('assets/pdfs/with_cropbox.pdf'),
    { updateMetadata: false },
  );

  console.log('Title:', pdfDoc.getTitle());
  console.log('Author:', pdfDoc.getAuthor());
  console.log('Subject:', pdfDoc.getSubject());
  console.log('Creator:', pdfDoc.getCreator());
  console.log('Keywords:', pdfDoc.getKeywords());
  console.log('Producer:', pdfDoc.getProducer());
  console.log('Creation Date:', pdfDoc.getCreationDate());
  console.log('Modification Date:', pdfDoc.getModificationDate());

  const pdfBytes = await pdfDoc.save();

  fs.writeFileSync('./out.pdf', pdfBytes);

  openPdf('./out.pdf', Reader.Acrobat);
})();
