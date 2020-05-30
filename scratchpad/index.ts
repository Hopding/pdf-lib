import fs from 'fs';
import { openPdf, Reader } from './open';

import { PDFDocument } from 'src/index';
import fetch from 'node-fetch';

(async () => {
  const jpgUrl = 'https://pdf-lib.js.org/assets/cat_riding_unicorn.jpg';
  const pdfUrl = 'https://pdf-lib.js.org/assets/us_constitution.pdf';

  const jpgAttachmentBytes = await fetch(jpgUrl).then((res) =>
    res.arrayBuffer(),
  );
  const pdfAttachmentBytes = await fetch(pdfUrl).then((res) =>
    res.arrayBuffer(),
  );

  const pdfDoc = await PDFDocument.create();

  await pdfDoc.attach(jpgAttachmentBytes, 'cat_riding_unicorn.jpg', {
    mimeType: 'image/jpeg',
    description: 'Cool cat riding a unicorn! 🦄🐈🕶️',
    creationDate: new Date('2019/12/01'),
    modificationDate: new Date('2020/04/19'),
  });

  await pdfDoc.attach(pdfAttachmentBytes, 'us_constitution.pdf', {
    mimeType: 'application/pdf',
    description: 'Constitution of the United States 🇺🇸🦅',
    creationDate: new Date('1787/09/17'),
    modificationDate: new Date('1992/05/07'),
  });

  const page = pdfDoc.addPage();
  page.drawText('This PDF has two attachments', { x: 135, y: 415 });

  const pdfBytes = await pdfDoc.save();

  fs.writeFileSync('./out.pdf', pdfBytes);

  openPdf('./out.pdf', Reader.Acrobat);
})();
