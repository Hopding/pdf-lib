import {
  degrees,
  PDFDocument,
  rgb,
  StandardFonts,
  LineCapStyle,
} from 'pdf-lib';

import { fetchAsset, writePdf } from './assets';

export default async () => {
  const [inputPdfBytes, catRidingUnicornBytes, cmykBytes] = await Promise.all([
    fetchAsset('pdfs/with_update_sections.pdf'),
    fetchAsset('images/cat_riding_unicorn_resized.jpg'),
    fetchAsset('images/cmyk_colorspace.jpg'),
  ]);

  const pdfDoc = await PDFDocument.load(inputPdfBytes, {
    updateMetadata: false,
  });

  const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const catRidingUnicornImage = await pdfDoc.embedJpg(catRidingUnicornBytes);
  const cmykImage = await pdfDoc.embedJpg(cmykBytes);

  const catRidingUnicornDims = catRidingUnicornImage.scale(0.25);
  const cmykDims = cmykImage.scale(0.5);

  const page0 = pdfDoc.insertPage(0, [305, 250]);
  const page1 = pdfDoc.getPage(1);
  const page2 = pdfDoc.addPage([305, 250]);

  const hotPink = rgb(1, 0, 1);
  const red = rgb(1, 0, 0);

  page0.drawText('This is the new first page!', {
    x: 5,
    y: 200,
    font: helveticaFont,
    color: hotPink,
  });
  page0.drawImage(catRidingUnicornImage, {
    ...catRidingUnicornDims,
    x: 30,
    y: 30,
  });

  const lastPageText = 'This is the last page!';
  const lastPageTextWidth = helveticaFont.widthOfTextAtSize(lastPageText, 24);

  const page1Text = 'pdf-lib is awesome!';
  const page1TextWidth = helveticaFont.widthOfTextAtSize(page1Text, 70);
  page1.setFontSize(70);
  page1.drawText(page1Text, {
    x: page1.getWidth() / 2 - page1TextWidth / 2 + 45,
    y: page1.getHeight() / 2 + 45,
    color: red,
    rotate: degrees(-30),
    xSkew: degrees(15),
    ySkew: degrees(15),
  });

  page2.setFontSize(24);
  page2.drawText('This is the last page!', {
    x: 30,
    y: 215,
    font: helveticaFont,
    color: hotPink,
  });
  page2.drawLine({
    start: { x: 30, y: 205 },
    end: { x: 30 + lastPageTextWidth, y: 205 },
    color: hotPink,
    thickness: 5,
    lineCap: LineCapStyle.Round,
  });
  page2.drawImage(cmykImage, {
    ...cmykDims,
    x: 30,
    y: 30,
  });

  console.log('Title:', pdfDoc.getTitle());
  console.log('Author:', pdfDoc.getAuthor());
  console.log('Subject:', pdfDoc.getSubject());
  console.log('Creator:', pdfDoc.getCreator());
  console.log('Keywords:', pdfDoc.getKeywords());
  console.log('Producer:', pdfDoc.getProducer());
  console.log('Creation Date:', pdfDoc.getCreationDate());
  console.log('Modification Date:', pdfDoc.getModificationDate());

  const base64Pdf = await pdfDoc.saveAsBase64({ dataUri: true });

  return { base64Pdf };

  // const pdfBytes = await pdfDoc.save();

  // const path = await writePdf(pdfBytes);

  // return { base64Pdf: `file://${path}` };
};
