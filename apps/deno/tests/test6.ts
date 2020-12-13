import fontkit from 'https://cdn.skypack.dev/@pdf-lib/fontkit@^1.0.0?dts';
import { Assets } from '../index.ts';

// @deno-types="../dummy.d.ts"
import {
  degrees,
  ParseSpeeds,
  PDFDocument,
  rgb,
} from '../../../dist/pdf-lib.esm.js';

export default async (assets: Assets) => {
  const { pdfs, images, fonts } = assets;

  const pdfDoc = await PDFDocument.load(
    pdfs.with_missing_endstream_eol_and_polluted_ctm,
    { parseSpeed: ParseSpeeds.Fastest },
  );

  pdfDoc.registerFontkit(fontkit);

  await pdfDoc.attach(pdfs.us_constitution, 'us_constitution.pdf', {
    mimeType: 'application/pdf',
    description: 'Constitution of the United States 🇺🇸🦅',
    creationDate: new Date('1787/09/17'),
    modificationDate: new Date('1992/05/07'),
  });

  await pdfDoc.attach(
    images.jpg.cat_riding_unicorn_base64,
    'cat_riding_unicorn.jpg',
    {
      mimeType: 'image/jpeg',
      description: 'Cool cat riding a unicorn! 🦄🐈🕶️',
      creationDate: new Date('2019/12/01'),
      modificationDate: new Date('2020/04/19'),
    },
  );

  const nunitoLigaFont = await pdfDoc.embedFont(fonts.ttf.nunito, {
    subset: true,
    features: { liga: true },
  });
  const nunitoNoLigaFont = await pdfDoc.embedFont(fonts.ttf.nunito, {
    subset: true,
    features: { liga: false },
  });
  const smallMarioImage = await pdfDoc.embedPng(images.png.small_mario);
  const smallMarioDims = smallMarioImage.scale(0.15);

  const page1 = pdfDoc.getPage(0);

  const text =
    'This is an image of Mario running. This image and text was drawn on top of an existing PDF using pdf-lib!';
  const fontSize = 24;
  const solarizedWhite = rgb(253 / 255, 246 / 255, 227 / 255);
  const solarizedGray = rgb(101 / 255, 123 / 255, 131 / 255);

  const boxWidth = 387.5;

  const { width, height } = page1.getSize();
  const centerX = width / 2;
  const centerY = height / 2;
  page1.drawImage(smallMarioImage, {
    ...smallMarioDims,
    x: centerX - smallMarioDims.width / 2,
    y: centerY - 15,
  });
  page1.drawImage(smallMarioImage, {
    ...smallMarioDims,
    x: centerX + smallMarioDims.width / 2,
    y: centerY,
    rotate: degrees(180),
    xSkew: degrees(35),
    ySkew: degrees(35),
  });
  const boxHeight = (fontSize + 5) * 3;
  page1.drawRectangle({
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
  page1.setFont(nunitoLigaFont);
  page1.setFontColor(solarizedGray);
  page1.drawText(text, {
    x: centerX - boxWidth / 2 + 5,
    y: centerY - 60,
    rotate: degrees(10),
    ySkew: degrees(15),
    maxWidth: boxWidth + 5,
  });

  page1.setSize(page1.getWidth() + 100, page1.getHeight() + 100);
  page1.translateContent(100, 100);

  page1.setFont(nunitoLigaFont);
  page1.drawText('This text is shifted - fi', {
    color: rgb(1, 0, 0),
    size: 50,
  });
  page1.resetPosition();
  page1.setFont(nunitoNoLigaFont);
  page1.drawText('This text is not shifted - fi', {
    color: rgb(0, 0, 1),
    size: 50,
  });

  // Add page with CropBox
  const pdfDocWithCropBox = await PDFDocument.load(pdfs.with_cropbox);
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

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
