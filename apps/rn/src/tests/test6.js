import fontkit from '@pdf-lib/fontkit';
import { degrees, PDFDocument, rgb } from 'pdf-lib';

import { fetchAsset, writePdf } from './assets';

export default async () => {
  const [
    inputPdfBytes,
    ubuntuBytes,
    smallMarioBytes,
    withCropBoxPdfBytes,
  ] = await Promise.all([
    fetchAsset('pdfs/with_missing_endstream_eol_and_polluted_ctm.pdf'),
    fetchAsset('fonts/ubuntu/Ubuntu-R.ttf'),
    fetchAsset('images/small_mario_resized.png'),
    fetchAsset('pdfs/with_cropbox.pdf'),
  ]);

  const pdfDoc = await PDFDocument.load(inputPdfBytes);

  pdfDoc.registerFontkit(fontkit);

  const ubuntuFont = await pdfDoc.embedFont(ubuntuBytes, { subset: true });
  const smallMarioImage = await pdfDoc.embedPng(smallMarioBytes);
  const smallMarioDims = smallMarioImage.scale(0.7);

  const page = pdfDoc.getPage(0);

  const text =
    'This is an image of Mario running. This image and text was drawn on top of an existing PDF using pdf-lib!';
  const fontSize = 24;
  const solarizedWhite = rgb(253 / 255, 246 / 255, 227 / 255);
  const solarizedGray = rgb(101 / 255, 123 / 255, 131 / 255);

  const boxWidth = 387.5;

  const { width, height } = page.getSize();
  const centerX = width / 2;
  const centerY = height / 2;
  page.drawImage(smallMarioImage, {
    ...smallMarioDims,
    x: centerX - smallMarioDims.width / 2,
    y: centerY - 15,
  });
  page.drawImage(smallMarioImage, {
    ...smallMarioDims,
    x: centerX + smallMarioDims.width / 2,
    y: centerY,
    rotate: degrees(180),
    xSkew: degrees(35),
    ySkew: degrees(35),
  });
  const boxHeight = (fontSize + 5) * 3;
  page.drawRectangle({
    x: centerX - boxWidth / 2 - 5,
    y: centerY - 60 - boxHeight + fontSize + 3,
    width: boxWidth + 10,
    height: boxHeight,
    color: solarizedWhite,
    borderColor: solarizedGray,
    borderWidth: 3,
    rotate: degrees(10),
    ySkew: degrees(15),
  });
  page.setFont(ubuntuFont);
  page.setFontColor(solarizedGray);
  page.drawText(text, {
    x: centerX - boxWidth / 2 + 5,
    y: centerY - 60,
    rotate: degrees(10),
    ySkew: degrees(15),
    maxWidth: boxWidth + 5,
  });

  page.setSize(page.getWidth() + 100, page.getHeight() + 100);
  page.translateContent(100, 100);

  page.drawText('This text is shifted', {
    color: rgb(1, 0, 0),
    size: 50,
  });
  page.resetPosition();
  page.drawText('This text is not shifted', {
    color: rgb(0, 0, 1),
    size: 50,
  });

  // Add page with CropBox
  const pdfDocWithCropBox = await PDFDocument.load(withCropBoxPdfBytes);
  const [page2] = await pdfDoc.copyPages(pdfDocWithCropBox, [0]);
  pdfDoc.addPage(page2);

  page2.drawRectangle({
    x: page2.getWidth(),
    width: 50,
    height: page2.getHeight(),
    color: rgb(1, 0, 0),
  });
  page2.drawRectangle({
    y: page2.getHeight(),
    height: 50,
    width: page2.getWidth(),
    color: rgb(0, 1, 0),
  });
  page2.setSize(page2.getWidth() + 50, page2.getHeight() + 50);

  const base64Pdf = await pdfDoc.saveAsBase64({ dataUri: true });

  return { base64Pdf };

  // const pdfBytes = await pdfDoc.save();

  // const path = await writePdf(pdfBytes);

  // return { base64Pdf: `file://${path}` };
};
