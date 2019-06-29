import fontkit from '@pdf-lib/fontkit';
import { Assets } from '..';
import { degrees, PDFDocument, rgb } from '../../..';

export default async (assets: Assets) => {
  const { pdfs, images, fonts } = assets;

  const pdfDoc = PDFDocument.load(
    pdfs.with_missing_endstream_eol_and_polluted_ctm,
  );

  pdfDoc.registerFontkit(fontkit);

  const ubuntuFont = pdfDoc.embedFont(fonts.ttf.ubuntu_r, { subset: true });
  const smallMarioImage = pdfDoc.embedPng(images.png.small_mario);
  const smallMarioDims = smallMarioImage.scale(0.15);

  const page = pdfDoc.getPages()[0];

  const lines = [
    'This is an image of Mario running.',
    'This image and text was drawn on',
    'top of an existing PDF using pdf-lib!',
  ];
  const fontSize = 24;
  const solarizedWhite = rgb(253 / 255, 246 / 255, 227 / 255);
  const solarizedGray = rgb(101 / 255, 123 / 255, 131 / 255);

  const textWidth = ubuntuFont.widthOfTextAtSize(lines[2], fontSize);

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
  const boxHeight = (fontSize + 5) * lines.length;
  page.drawRectangle({
    x: centerX - textWidth / 2 - 5,
    y: centerY - 60 - boxHeight + fontSize + 3,
    width: textWidth + 10,
    height: boxHeight,
    color: solarizedWhite,
    borderColor: solarizedGray,
    borderWidth: 3,
    rotate: degrees(10),
    ySkew: degrees(15),
  });
  page.setFont(ubuntuFont);
  page.setFontColor(solarizedGray);
  page.drawText(lines.join('\n'), {
    x: centerX - textWidth / 2,
    y: centerY - 60,
    rotate: degrees(10),
    ySkew: degrees(15),
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
