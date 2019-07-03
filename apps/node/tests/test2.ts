import fontkit from '@pdf-lib/fontkit';
import { Assets } from '..';
import { ParseSpeeds, PDFDocument, rgb } from '../../..';

export default async (assets: Assets) => {
  const { fonts, images, pdfs } = assets;

  const pdfDoc = await PDFDocument.load(pdfs.linearized_with_object_streams, {
    parseSpeed: ParseSpeeds.Fastest,
  });

  pdfDoc.registerFontkit(fontkit);

  const ubuntuFont = await pdfDoc.embedFont(fonts.ttf.ubuntu_r, {
    subset: true,
  });
  const smallMarioImage = await pdfDoc.embedPng(images.png.small_mario);
  const smallMarioDims = smallMarioImage.scale(0.18);

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
    const centerY = height / 2;
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

  pdfDoc.removePage(1);

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
