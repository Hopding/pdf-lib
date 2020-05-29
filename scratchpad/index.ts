import fs from 'fs';
import { openPdf, Reader } from './open';

import { PDFDocument } from 'src/index';

(async () => {
  // These should be Uint8Arrays or ArrayBuffers
  // This data can be obtained in a number of different ways
  // If your running in a Node environment, you could use fs.readFile()
  // In the browser, you could make a fetch() call and use res.arrayBuffer()
  const jpgAttachmentBytes = fs.readFileSync(
    'assets/images/cat_riding_unicorn.jpg',
  );
  const pdfAttachmentBytes = fs.readFileSync('assets/pdfs/us_constitution.pdf');

  // Create a new PDFDocument
  const pdfDoc = await PDFDocument.create();

  // Add the JPG attachment
  await pdfDoc.attach(jpgAttachmentBytes, 'cat_riding_unicorn.jpg', {
    mimeType: 'image/jpeg',
    description: 'Cool cat riding a unicorn! 🦄🐈🕶️',
    creationDate: new Date('2019/12/01'),
    modificationDate: new Date('2020/04/19'),
  });

  // Add the PDF attachment
  await pdfDoc.attach(pdfAttachmentBytes, 'us_constitution.pdf', {
    mimeType: 'application/pdf',
    description: 'Constitution of the United States 🇺🇸🦅',
    creationDate: new Date('1787/09/17'),
    modificationDate: new Date('1992/05/07'),
  });

  // Add a page with some text
  const page = pdfDoc.addPage();
  page.drawText('This PDF has two attachments', { x: 135, y: 415 });

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();

  // For example, `pdfBytes` can be:
  //   • Written to a file in Node
  //   • Downloaded from the browser
  //   • Rendered in an <iframe>

  fs.writeFileSync('./out.pdf', pdfBytes);

  openPdf('./out.pdf', Reader.Acrobat);
})();
