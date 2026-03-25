import {
  PageSizes,
  PDFDocument,
  BlendMode,
  LineCapStyle,
  cmyk,
  degrees,
  rgb,
  values,
} from 'pdf-lib';

import { fetchAsset } from './assets';

const inchToPt = (inches) => Math.round(inches * 72);

const firstPage = async (pdfDoc) => {
  const page = pdfDoc.addPage(PageSizes.Letter);

  // SVG sample paths from
  // https://svgwg.org/svg2-draft/paths.html

  // bezier curve example
  page.drawSvgPath('M100,200 C100,100 250,100 250,200 S400,300 400,200', {
    x: inchToPt(0.25),
    y: inchToPt(12),
  });

  // downward facing triangle
  page.drawSvgPath('M 100 100 L 300 100 L 200 300 z', {
    x: inchToPt(-1),
    y: inchToPt(12),
    color: rgb(1, 0, 0),
    borderColor: rgb(0, 0, 1),
    borderWidth: 1,
    opacity: 0.7,
    borderOpacity: 0.7,
  });

  // bezier control point adjustments
  page.drawSvgPath('M100,200 C100,100 400,100 400,200', {
    x: inchToPt(-1),
    y: inchToPt(9.25),
  });
  page.drawSvgPath('M600,200 C675,100 975,100 900,200', {
    x: inchToPt(-4.5),
    y: inchToPt(8.25),
  });
  page.drawSvgPath('M100,500 C25,400 475,400 400,500', {
    x: inchToPt(-1),
    y: inchToPt(11.25),
  });
  page.drawSvgPath('M600,500 C600,350 900,650 900,500', {
    x: inchToPt(-4.5),
    y: inchToPt(10.25),
  });
  page.drawSvgPath('M100,800 C175,700 325,700 400,800', {
    x: inchToPt(-1),
    y: inchToPt(13.35),
  });
  page.drawSvgPath('M600,800 C625,700 725,700 750,800 S875,900 900,800', {
    x: inchToPt(-4.5),
    y: inchToPt(12.25),
  });
};

const secondPage = async (pdfDoc) => {
  const page = pdfDoc.addPage(PageSizes.Letter);

  // quadratic bezier example
  page.drawSvgPath('M200,300 Q400,50 600,300 T1000,300', {
    x: 100,
    y: 700,
    scale: 0.5,
    borderWidth: 4,
    borderDashArray: [24, 12],
    borderLineCap: LineCapStyle.Round,
    rotate: degrees(30),
  });
  page.drawSvgPath('M200,300 L400,50 L600,300 L800,550 L1000,300', {
    x: inchToPt(-1),
    y: inchToPt(9),
    scale: 0.5,
    borderWidth: 2,
  });

  // arc examples
  page.drawSvgPath('M300,200 h-150 a150,150 0 1,0 150,-150 z', {
    x: inchToPt(-1),
    y: inchToPt(5.5),
    color: rgb(1, 0, 0),
    borderColor: rgb(0, 0, 1),
    borderWidth: 1,
  });
  page.drawSvgPath('M275,175 v-150 a150,150 0 0,0 -150,150 z', {
    x: inchToPt(-1),
    y: inchToPt(5.5),
    color: rgb(1, 1, 0),
    borderColor: rgb(0, 0, 1),
    borderWidth: 1,
  });
  page.drawSvgPath(
    'M600,350 l 50,-25 a25,25 -30 0,1 50,-25 l 50,-25 a25,50 -30 0,1 50,-25 l 50,-25 a25,75 -30 0,1 50,-25 l 50,-25 a25,100 -30 0,1 50,-25 l 50,-25',
    {
      x: inchToPt(1),
      y: inchToPt(3),
      scale: 0.5,
      borderColor: rgb(1, 0, 0),
      borderWidth: 2,
    },
  );
  page.drawCircle({
    x: inchToPt(3),
    y: inchToPt(5),
    color: rgb(0, 1, 1),
    opacity: 0.1,
    borderWidth: 3,
    borderColor: rgb(1, 0, 1),
    borderOpacity: 0.2,
  });
  page.drawText('Semi-Transparent Text', {
    color: rgb(0, 1, 1),
    opacity: 0.5,
    x: inchToPt(1),
    y: inchToPt(2.5),
    size: 50,
  });
};

const thirdPage = async (pdfDoc, assets) => {
  const page = pdfDoc.addPage(PageSizes.Letter);

  const modeNames = values(BlendMode);

  page.drawRectangle({
    x: 30,
    y: 30,
    width: 100,
    height: 732,
    color: cmyk(0, 0.7, 0.3, 0),
    blendMode: BlendMode.Normal,
  });

  page.drawRectangle({
    x: 340,
    y: 30,
    width: 100,
    height: 732,
    color: cmyk(0.6, 0, 0.3, 0),
    blendMode: BlendMode.Normal,
  });

  page.drawText('pdf-lib Blend Mode Test', {
    size: 24,
    x: 45,
    y: 735,
    color: cmyk(0.75, 0, 0, 0),
    blendMode: BlendMode.Multiply,
  });

  // List all blend modes available
  modeNames.forEach((m, i) => {
    page.drawText(`blendMode: ${m}`, {
      size: 14,
      x: 40,
      y: 700 - i * 20,
      color: cmyk(0, 0, 0, 0.65),
      blendMode: m,
    });
  });

  // quadratic bezier example
  page.drawSvgPath('M200,300 Q400,50 600,300 T1000,300', {
    x: inchToPt(-1),
    y: inchToPt(10),
    scale: 0.5,
    borderWidth: 6,
    borderColor: cmyk(0, 0, 0, 1),
    blendMode: BlendMode.Overlay,
  });

  // arc examples
  page.drawSvgPath('M300,200 h-150 a150,150 0 1,0 150,-150 z', {
    x: inchToPt(-1),
    y: inchToPt(5.5),
    color: cmyk(0, 1, 1, 0),
    borderColor: cmyk(1, 0.7, 0, 0),
    borderWidth: 2,
    blendMode: BlendMode.HardLight,
  });

  page.drawSvgPath('M275,175 v-150 a150,150 0 0,0 -150,150 z', {
    x: inchToPt(-1),
    y: inchToPt(5.5),
    color: cmyk(0, 0.3, 1, 0),
    borderColor: cmyk(0, 0, 0, 1),
    borderWidth: 2,
    blendMode: BlendMode.Darken,
  });

  // rectangle example
  page.drawRectangle({
    x: 350,
    y: 220,
    width: 60,
    height: 160,
    rotate: degrees(-30),
    color: cmyk(0.4, 0, 1, 0),
    borderColor: cmyk(0, 1, 1, 0),
    borderWidth: 2,
    blendMode: BlendMode.ColorBurn,
  });

  // circle example
  page.drawCircle({
    x: inchToPt(3),
    y: inchToPt(5),
    color: cmyk(0.7, 1, 0.5, 0),
    blendMode: BlendMode.ColorDodge,
  });

  // add alpha-image with 'Screen' blend mode
  // const pngImage = await pdfDoc.embedPng(assets.images.png.self_drive);
  const pngImage = await pdfDoc.embedPng(assets.selfDrivePngBytes);
  const pngDims = pngImage.scale(1.0);

  const cx = page.getWidth() / 2 - 70;
  const cy = page.getHeight() / 2;

  page.drawImage(pngImage, {
    x: cx - pngDims.width / 2,
    y: cy - pngDims.height / 2,
    width: pngDims.width,
    height: pngDims.height,
    blendMode: BlendMode.Screen,
  });

  // embed page from other PDF using blendMode
  const [embeddedPage] = await pdfDoc.embedPdf(
    // assets.pdfs.simple_pdf_2_example,
    assets.simplePdf2ExampleBytes,
    [0],
  );

  const [px, py, scale] = [300, 100, 0.33];

  const { width, height } = embeddedPage.scale(scale);

  page.drawPage(embeddedPage, {
    x: px,
    y: py,
    xScale: scale,
    yScale: scale,
    blendMode: BlendMode.Multiply,
  });

  page.drawRectangle({
    x: px,
    y: py,
    width,
    height,
    borderColor: cmyk(0, 1, 1, 0),
    borderWidth: 2,
    blendMode: BlendMode.Normal,
  });

  page.drawText('Embedded PDF document (blendMode: Multiply)', {
    size: 9,
    x: px,
    y: py - 12,
    color: cmyk(0, 0, 0, 1),
    blendMode: BlendMode.Multiply,
  });
};

export default async () => {
  const [selfDrivePngBytes, simplePdf2ExampleBytes] = await Promise.all([
    fetchAsset('images/self_drive.png'),
    fetchAsset('pdfs/pdf20examples/Simple PDF 2.0 file.pdf'),
  ]);

  const pdfDoc = await PDFDocument.create();

  await firstPage(pdfDoc);
  await secondPage(pdfDoc);
  await thirdPage(pdfDoc, { selfDrivePngBytes, simplePdf2ExampleBytes });

  const base64Pdf = await pdfDoc.saveAsBase64({ dataUri: true });

  return { base64Pdf };
};
