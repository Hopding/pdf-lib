import { Assets } from '../index.ts';

// @deno-types="../dummy.d.ts"
import {
  ParseSpeeds,
  PDFPage,
  PDFDocument,
  rgb,
  StandardFonts,
} from '../../../dist/pdf-lib.esm.js';

export default async (assets: Assets) => {
  const { pdfs, images } = assets;

  const pdfDoc = await PDFDocument.load(pdfs.with_large_page_count, {
    parseSpeed: ParseSpeeds.Fastest,
  });

  const timesRomanFont = await pdfDoc.embedFont(
    StandardFonts.TimesRomanBoldItalic,
  );
  const minionsBananaImage = await pdfDoc.embedPng(
    images.png.minions_banana_alpha,
  );
  const minionsBananaDims = minionsBananaImage.scale(0.5);

  const pages = pdfDoc.getPages();

  pages.forEach((page: PDFPage) => {
    const { width, height } = page.getSize();
    page.drawImage(minionsBananaImage, {
      ...minionsBananaDims,
      x: width / 2 - minionsBananaDims.width / 2,
      y: height / 2 - minionsBananaDims.height / 2,
    });
  });

  // Interleave new pages between all existing ones
  pages.forEach((_: PDFPage, idx: number) => {
    const newPage = pdfDoc.insertPage(2 * idx + 1, [500, 150]);

    const fontSize = 24;
    const { width, height } = newPage.getSize();

    newPage.setFont(timesRomanFont);
    newPage.setFontSize(fontSize);

    const text = 'This page was interleaved by pdf-lib!';
    const textWidth = timesRomanFont.widthOfTextAtSize(text, fontSize);
    const textHeight = timesRomanFont.heightAtSize(fontSize);

    newPage.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: height / 2 - textHeight / 2,
      color: rgb(0.7, 0.4, 0.9),
    });
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
