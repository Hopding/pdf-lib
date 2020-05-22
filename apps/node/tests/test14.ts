import { Assets } from '..';

import { PDFDocument } from '../../..';

export default async (assets: Assets) => {
  const { pdfs } = assets;

  const pdfDoc = await PDFDocument.create();

  const page = pdfDoc.addPage();

  pdfDoc.attach(pdfs.normal, 'normal.pdf');

  page.drawText('This is a document with an attachment', { x: 100, y: 700 });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
