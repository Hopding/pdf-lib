import fontkit from '@pdf-lib/fontkit';
import { Assets } from '..';
import { ParseSpeeds, PDFDocument, rgb } from '../../..';

// This test loads an existing PDF document with many pages.
// It inserts data for every page (images, rectangles, texts, embedded PDFs).
// Also, the second page is removed.
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
  const sourcePdfDoc = await PDFDocument.load(
    assets.pdfs.with_large_page_count,
  );
  const sourcePdfPage = sourcePdfDoc.getPages()[73];

  const embeddedPagePos = {
    xOffset: 100,
    yOffset: 330,
    width: 350,
    height: 240,
    padding: 10,
  };
  const embeddedPage = await pdfDoc.embedPage(
    sourcePdfPage,
    {
      // clip the PDF page to a certain area within the page
      left: embeddedPagePos.xOffset,
      right: embeddedPagePos.xOffset + embeddedPagePos.width,
      bottom: embeddedPagePos.yOffset,
      top: embeddedPagePos.yOffset + embeddedPagePos.height,
    },
    // move the clipped part to (0,0) of the embeddedPage for easier inserting
    [1, 0, 0, 1, -embeddedPagePos.xOffset, -embeddedPagePos.yOffset],
  );

  const lines = [
    'This is an image of Mario running.',
    'This image and text was drawn on',
    'top of an existing PDF using pdf-lib!',
  ];
  const fontSize = 24;
  const solarizedWhite = rgb(253 / 255, 246 / 255, 227 / 255);
  const solarizedGray = rgb(101 / 255, 123 / 255, 131 / 255);

  const textWidth = ubuntuFont.widthOfTextAtSize(lines[2], fontSize);

  pdfDoc.getPages().forEach((page) => {
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
    page.drawRectangle({
      x: 10,
      y: 10,
      width: embeddedPagePos.width / 2 + embeddedPagePos.padding * 2,
      height: embeddedPagePos.height / 2 + embeddedPagePos.padding * 2,
      color: solarizedWhite,
      borderColor: solarizedGray,
      borderWidth: 2,
    });
    page.drawPage(embeddedPage, {
      x: embeddedPagePos.padding + 10,
      y: embeddedPagePos.padding + 10,
      xScale: 0.5,
      yScale: 0.5,
    });
  });

  pdfDoc.removePage(1);

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
