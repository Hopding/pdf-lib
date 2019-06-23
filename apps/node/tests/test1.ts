import { PDFDocument } from '../../..';

export default async () => {
  const pdfDoc = PDFDocument.create();
  pdfDoc.addPage().drawCircle();
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
