import { PDFDocument, radians, StandardFonts, rgb, degrees } from 'pdf-lib';

import { fetchAsset } from './assets';

export default async () => {
  const [inputPdf, minionsLaughingBytes] = await Promise.all([
    fetchAsset('pdfs/normal.pdf'),
    fetchAsset('images/minions_laughing.jpg'),
  ]);

  const pdfDoc = await PDFDocument.load(inputPdf);

  const minionsLaughingImage = await pdfDoc.embedJpg(minionsLaughingBytes);
  const minionsLaughingDims = minionsLaughingImage.scale(0.6);

  const firstPage = pdfDoc.getPage(0);
  const middlePage = pdfDoc.insertPage(1, [600, 500]);
  const lastPage = pdfDoc.getPage(2);

  const fontSize = 20;
  middlePage.setFontSize(fontSize);
  middlePage.moveTo(0, middlePage.getHeight());

  Object.keys(StandardFonts).forEach((fontName, idx) => {
    middlePage.moveDown(fontSize);
    const font = pdfDoc.embedStandardFont(StandardFonts[fontName]);
    middlePage.setFont(font);

    // prettier-ignore
    const text = (
        fontName === StandardFonts.Symbol ? `${idx + 1}. Τηεσε αρε τηε 14 Στανδαρδ Φοντσ.`
      : fontName === StandardFonts.ZapfDingbats ? '✑✔✎ ✴❈❅▲❅ ❁❒❅ ▼❈❅ ✑✔ ✳▼❁■❄❁❒❄ ✦❏■▼▲✎'
      : `${idx + 1}. These are the 14 Standard Fonts.`
    );

    middlePage.drawText(text, {
      rotate: radians(-Math.PI / 6),
      xSkew: radians(Math.PI / 10),
      ySkew: radians(Math.PI / 10),
    });
  });

  middlePage.drawEllipse({
    x: 450,
    y: 225,
    xScale: 25,
    yScale: 150,
    color: rgb(0, 1, 0),
    borderWidth: 2,
    borderColor: rgb(1, 0, 1),
    rotate: degrees(45),
    opacity: 0.5,
  });

  const stampImage = (page) => {
    const { width, height } = page.getSize();
    const centerX = width / 2;
    const centerY = height / 2;
    page.drawImage(minionsLaughingImage, {
      ...minionsLaughingDims,
      x: centerX - minionsLaughingDims.width / 2,
      y: centerY - minionsLaughingDims.height / 2,
      opacity: 0.75,
    });
  };

  stampImage(firstPage);
  stampImage(lastPage);

  const base64Pdf = await pdfDoc.saveAsBase64({ dataUri: true });

  return { base64Pdf };

  // const pdfBytes = await pdfDoc.save();

  // const path = await writePdf(pdfBytes);

  // return { base64Pdf: `file://${path}` };
};
