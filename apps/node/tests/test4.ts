import { Assets } from '..';
import {
  ParseSpeeds,
  PDFDocument,
  PDFPage,
  radians,
  StandardFonts,
  rgb,
  degrees,
} from '../../..';

export default async (assets: Assets) => {
  const { pdfs, images } = assets;

  const pdfDoc = await PDFDocument.load(pdfs.normal_base64, {
    parseSpeed: ParseSpeeds.Fastest,
  });

  const minionsLaughingImage = await pdfDoc.embedJpg(
    images.jpg.minions_laughing,
  );
  const minionsLaughingDims = minionsLaughingImage.scale(0.6);

  const firstPage = pdfDoc.getPage(0);
  const middlePage = pdfDoc.insertPage(1, [600, 500]);
  const lastPage = pdfDoc.getPage(2);

  const fontSize = 20;
  middlePage.setFontSize(fontSize);
  middlePage.moveTo(0, middlePage.getHeight());

  Object.keys(StandardFonts).forEach((fontNameStr, idx) => {
    middlePage.moveDown(fontSize);

    const fontName = fontNameStr as keyof typeof StandardFonts;
    const fontObj = StandardFonts[fontName];
    const font = pdfDoc.embedStandardFont(fontObj);

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

  const stampImage = (page: PDFPage) => {
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

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
