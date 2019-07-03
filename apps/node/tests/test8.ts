import { Assets } from '..';
import { ParseSpeeds, PDFDocument, rgb, StandardFonts } from '../../..';

export default async (assets: Assets) => {
  const { pdfs } = assets;

  const pdfDoc = await PDFDocument.load(
    pdfs.with_newline_whitespace_in_indirect_object_numbers,
    { parseSpeed: ParseSpeeds.Fastest },
  );

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

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
