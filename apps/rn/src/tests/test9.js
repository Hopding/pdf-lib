import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, rgb } from 'pdf-lib';

import { fetchAsset } from './assets';

export default async () => {
  const [inputPdfBytes, ubuntuBytes, smallMarioBytes] = await Promise.all([
    fetchAsset('pdfs/with_comments.pdf'),
    fetchAsset('fonts/ubuntu/Ubuntu-R.ttf'),
    fetchAsset('images/small_mario_resized.png'),
  ]);

  const pdfDoc = await PDFDocument.load(inputPdfBytes);

  pdfDoc.registerFontkit(fontkit);

  const ubuntuFont = await pdfDoc.embedFont(ubuntuBytes, { subset: true });
  const smallMarioImage = await pdfDoc.embedPng(smallMarioBytes);
  const smallMarioDims = smallMarioImage.scale(0.65);

  const pages = pdfDoc.getPages();

  const lines = [
    'This is an image of Mario running.',
    'This image and text was drawn on',
    'top of an existing PDF using pdf-lib!',
  ];
  const fontSize = 24;
  const solarizedWhite = rgb(253 / 255, 246 / 255, 227 / 255);
  const solarizedGray = rgb(101 / 255, 123 / 255, 131 / 255);

  const textWidth = ubuntuFont.widthOfTextAtSize(lines[2], fontSize);

  pages.forEach((page) => {
    const { width, height } = page.getSize();
    const centerX = width / 2;
    const centerY = height / 2 - 250;
    page.drawImage(smallMarioImage, {
      ...smallMarioDims,
      x: centerX - smallMarioDims.width / 2,
      y: centerY + 15,
    });
    const boxHeight = (fontSize + 5) * lines.length;
    page.drawRectangle({
      x: centerX - textWidth / 2 - 5,
      y: centerY - 15 - boxHeight + fontSize + 3,
      width: textWidth + 10,
      height: boxHeight,
      color: solarizedWhite,
      borderColor: solarizedGray,
      borderWidth: 3,
    });
    page.setFont(ubuntuFont);
    page.setFontColor(solarizedGray);
    page.drawText(lines.join('\n'), {
      x: centerX - textWidth / 2,
      y: centerY - 15,
    });
  });

  const base64Pdf = await pdfDoc.saveAsBase64({ dataUri: true });

  return { base64Pdf };

  // const pdfBytes = await pdfDoc.save();

  // const path = await writePdf(pdfBytes);

  // return { base64Pdf: `file://${path}` };
};
