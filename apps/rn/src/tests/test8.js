import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

import { fetchAsset } from './assets';

export default async () => {
  const [inputPdfBytes] = await Promise.all([
    fetchAsset('pdfs/with_newline_whitespace_in_indirect_object_numbers.pdf'),
  ]);

  const pdfDoc = await PDFDocument.load(inputPdfBytes);

  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pages = pdfDoc.getPages();

  const [firstPage] = pages;

  const { width, height } = firstPage.getSize();
  const text = 'pdf-lib is awesome!';
  const textWidth = helveticaFont.widthOfTextAtSize(text, 75);
  firstPage.moveTo(width / 2 - textWidth / 2, height - 100);
  firstPage.setFont(helveticaFont);
  firstPage.setFontSize(75);
  firstPage.setFontColor(rgb(1, 0, 0));
  firstPage.drawText(text);

  pages.forEach((page, idx) => {
    page.moveTo(10, 10);
    page.setFont(helveticaFont);
    page.setFontSize(17);
    page.setFontColor(rgb(1, 0, 0));
    page.drawText(`${idx + 1} / ${pages.length}`);
  });

  const base64Pdf = await pdfDoc.saveAsBase64({ dataUri: true });

  return { base64Pdf };

  // const pdfBytes = await pdfDoc.save();

  // const path = await writePdf(pdfBytes);

  // return { base64Pdf: `file://${path}` };
};
