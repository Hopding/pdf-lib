import { Assets } from '..';
import { PageSizes, PDFDocument, rgb, LineCapStyle } from '../../..';

const inchToPt = (inches: number) => Math.round(inches * 72);

export default async (_assets: Assets) => {
  const pdfDoc = await PDFDocument.create();

  const page1 = pdfDoc.addPage(PageSizes.Letter);

  // SVG sample paths from
  // https://svgwg.org/svg2-draft/paths.html

  // bezier curve example
  page1.drawSvgPath('M100,200 C100,100 250,100 250,200 S400,300 400,200', {
    x: inchToPt(0.25),
    y: inchToPt(12),
  });

  // downward facing triangle
  page1.drawSvgPath('M 100 100 L 300 100 L 200 300 z', {
    x: inchToPt(-1),
    y: inchToPt(12),
    color: rgb(1, 0, 0),
    borderColor: rgb(0, 0, 1),
    borderWidth: 1,
    opacity: 0.7,
    borderOpacity: 0.7,
  });

  // bezier control point adjustments
  page1.drawSvgPath('M100,200 C100,100 400,100 400,200', {
    x: inchToPt(-1),
    y: inchToPt(9.25),
  });
  page1.drawSvgPath('M600,200 C675,100 975,100 900,200', {
    x: inchToPt(-4.5),
    y: inchToPt(8.25),
  });
  page1.drawSvgPath('M100,500 C25,400 475,400 400,500', {
    x: inchToPt(-1),
    y: inchToPt(11.25),
  });
  page1.drawSvgPath('M600,500 C600,350 900,650 900,500', {
    x: inchToPt(-4.5),
    y: inchToPt(10.25),
  });
  page1.drawSvgPath('M100,800 C175,700 325,700 400,800', {
    x: inchToPt(-1),
    y: inchToPt(13.35),
  });
  page1.drawSvgPath('M600,800 C625,700 725,700 750,800 S875,900 900,800', {
    x: inchToPt(-4.5),
    y: inchToPt(12.25),
  });

  const page2 = pdfDoc.addPage(PageSizes.Letter);

  // quadratic bezier example
  page2.drawSvgPath('M200,300 Q400,50 600,300 T1000,300', {
    x: inchToPt(-1),
    y: inchToPt(11),
    scale: 0.5,
    borderWidth: 4,
    borderDashArray: [24, 12],
    borderLineCap: LineCapStyle.Round,
  });
  page2.drawSvgPath('M200,300 L400,50 L600,300 L800,550 L1000,300', {
    x: inchToPt(-1),
    y: inchToPt(9),
    scale: 0.5,
    borderWidth: 2,
  });

  // arc examples
  page2.drawSvgPath('M300,200 h-150 a150,150 0 1,0 150,-150 z', {
    x: inchToPt(-1),
    y: inchToPt(5.5),
    color: rgb(1, 0, 0),
    borderColor: rgb(0, 0, 1),
    borderWidth: 1,
  });
  page2.drawSvgPath('M275,175 v-150 a150,150 0 0,0 -150,150 z', {
    x: inchToPt(-1),
    y: inchToPt(5.5),
    color: rgb(1, 1, 0),
    borderColor: rgb(0, 0, 1),
    borderWidth: 1,
  });
  page2.drawSvgPath(
    'M600,350 l 50,-25 a25,25 -30 0,1 50,-25 l 50,-25 a25,50 -30 0,1 50,-25 l 50,-25 a25,75 -30 0,1 50,-25 l 50,-25 a25,100 -30 0,1 50,-25 l 50,-25',
    {
      x: inchToPt(1),
      y: inchToPt(3),
      scale: 0.5,
      borderColor: rgb(1, 0, 0),
      borderWidth: 2,
    },
  );
  page2.drawCircle({
    x: inchToPt(3),
    y: inchToPt(5),
    color: rgb(0, 1, 1),
    opacity: 0.1,
    borderWidth: 3,
    borderColor: rgb(1, 0, 1),
    borderOpacity: 0.2,
  });
  page2.drawText('Semi-Transparent Text', {
    color: rgb(0, 1, 1),
    opacity: 0.5,
    x: inchToPt(1),
    y: inchToPt(2.5),
    size: 50,
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
