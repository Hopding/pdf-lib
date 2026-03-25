import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

import { fetchAsset } from './assets';

export default async () => {
  const [inputPdfBytes, minionsBananaAlphaBytes] = await Promise.all([
    fetchAsset('pdfs/with_large_page_count.pdf'),
    fetchAsset('images/minions_banana_alpha.png'),
  ]);

  const pdfDoc = await PDFDocument.load(inputPdfBytes);

  const timesRomanFont = await pdfDoc.embedFont(
    StandardFonts.TimesRomanBoldItalic,
  );
  const minionsBananaImage = await pdfDoc.embedPng(minionsBananaAlphaBytes);
  const minionsBananaDims = minionsBananaImage.scale(0.5);

  const pages = pdfDoc.getPages();

  pages.forEach((page) => {
    const { width, height } = page.getSize();
    page.drawImage(minionsBananaImage, {
      ...minionsBananaDims,
      x: width / 2 - minionsBananaDims.width / 2,
      y: height / 2 - minionsBananaDims.height / 2,
    });
  });

  // Interleave new pages between all existing ones
  pages.forEach((_, idx) => {
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

  const base64Pdf = await pdfDoc.saveAsBase64({ dataUri: true });

  return { base64Pdf };

  // const pdfBytes = await pdfDoc.save();

  // const path = await writePdf(pdfBytes);

  // return { base64Pdf: `file://${path}` };
};
