import fs from 'fs';
import { openPdf, Reader } from './open';
import { PDFDocument } from '../src/index';

(async () => {
  const pdfDoc1 = await PDFDocument.create();
  const image1 = await pdfDoc1.embedPng(
    fs.readFileSync('assets/images/mario_emblem.png'),
  );
  const page1 = pdfDoc1.addPage();
  page1.drawImage(image1, { ...image1.scale(1.0) });

  const pdfDoc1Bytes = await pdfDoc1.save();

  const pdfDoc2 = await PDFDocument.load(pdfDoc1Bytes);
  const image2 = await pdfDoc2.embedPng(
    fs.readFileSync('assets/images/minions_banana_alpha.png'),
  );
  const page2 = pdfDoc2.getPage(0);
  page2.drawImage(image2, { ...image2.scale(0.5), x: 100, y: 100 });

  const pdfBytes = await pdfDoc2.save();

  fs.writeFileSync('out.pdf', pdfBytes);
  openPdf('out.pdf', Reader.Preview);
})();
