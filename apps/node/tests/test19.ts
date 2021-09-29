import { Assets } from '..';
import { PDFDocument, PDFPage } from '../../../cjs';

export default async (assets: Assets) => {

  const pdfDoc = await PDFDocument.load(assets.pdfs.with_annots);

  pdfDoc.getPages().forEach((p: PDFPage) => {
    p.scaleContent(0.5, 0.5);
  });

  return pdfDoc.save();
};
