
import {
  clip,
  clipEvenOdd,
  closePath,
  dashPattern,
  drawCircle,
  drawEllipse,
  drawImage,
  drawLinesOfText,
  drawRectangle,
  drawSquare,
  endPath,
  lineCap,
  lineJoin,
  lineTo,
  moveTo,
  PDFContentStream,
  PDFDocument,
  PDFDocumentFactory,
  PDFDocumentWriter,
  PDFPage,
  popGraphicsState,
  pushGraphicsState,
  translate,
} from '../../src';

import { ITestAssets, ITestKernel } from '../models';

const ipsumLines = [
  'Eligendi est pariatur quidem in non excepturi et.',
  'Consectetur non tenetur magnam est corporis tempor.',
  'Labore nisi officiis quia ipsum qui voluptatem omnis.',
];

const makePage1ContentStream = (pdfDoc: PDFDocument, size: number) =>
  pdfDoc.createContentStream(
    // Upper-left quadrant
    pushGraphicsState(),
    translate(0, size / 2),
    drawSquare({
      size: size / 2,
      colorRgb: [1, 0, 0],
    }),
    moveTo(0, size / 2),
    lineTo(0, 0),
    lineTo(size / 2, size / 2),
    closePath(),
    clip(),
    endPath(),
    drawSquare({
      x: size / 8,
      y: size / 8,
      size: size / 4,
      borderWidth: 50,
      borderColorRgb: [1, 1, 0],
    }),
    popGraphicsState(),

    // Upper-right quadrant
    pushGraphicsState(),
    translate(size / 2, size / 2),
    drawSquare({
      size: size / 2,
      colorRgb: [0, 1, 0],
    }),
    drawEllipse({
      x: size / 4,
      y: size / 4,
      xScale: 50,
      yScale: 75,
      colorRgb: [255 / 255, 153 / 255, 51 / 255],
      rotateDegrees: -45,
      skewDegrees: { xAxis: 30, yAxis: 30 },
    }),
    drawEllipse({
      x: size / 4,
      y: size / 4,
      xScale: 50,
      yScale: 75,
      rotateRadians: Math.PI / 2,
    }),
    drawEllipse({
      x: size / 4,
      y: size / 4,
      xScale: 100,
      yScale: 150,
      rotateDegrees: 90,
    }),
    clipEvenOdd(),
    endPath(),
    drawLinesOfText(
      [...ipsumLines, ...ipsumLines, ...ipsumLines, ...ipsumLines],
      {
        x: 5,
        y: size / 2 - 5 - 25,
        font: 'FontTimesRoman',
        size: 32,
        colorRgb: [1, 0, 1],
      },
    ),
    popGraphicsState(),

    // Lower-left quadrant
    pushGraphicsState(),
    translate(0, 0),
    drawSquare({
      size: size / 2,
      colorRgb: [0, 1, 1],
    }),
    dashPattern([25], 25),
    lineCap('round'),
    drawCircle({
      x: size / 4,
      y: size / 4,
      size: 150,
      borderWidth: 10,
      borderColorRgb: [0.9, 0, 0.9],
      rotateDegrees: 90,
      skewDegrees: { xAxis: 15, yAxis: 15 },
    }),
    popGraphicsState(),

    // Lower-right quadrant
    pushGraphicsState(),
    translate(size / 2, 0),
    drawSquare({
      size: size / 2,
      colorRgb: [0.8, 0.8, 0.8],
    }),
    lineJoin('round'),
    drawSquare({
      x: size / 4,
      y: 25,
      size: size / 2.25 - 2 * 50,
      rotateDegrees: 45,
      borderColorRgb: [0.6, 0.6, 0.6],
      borderWidth: 15,
    }),
    lineJoin('bevel'),
    drawSquare({
      x: 54,
      y: size / 4 + 1,
      size: size / 2.25 - 2 * 100,
      rotateDegrees: -45,
      skewDegrees: { xAxis: 45 / 2, yAxis: 45 / 2 },
      colorRgb: [1, 1, 1],
      borderColorRgb: [0, 0, 0],
      borderWidth: 15,
    }),
    popGraphicsState(),
  );

const makePage2ContentStream = (pdfDoc: PDFDocument, size: number) =>
  pdfDoc.createContentStream(
    drawSquare({
      size,
      colorRgb: [253 / 255, 246 / 255, 227 / 255],
    }),
    drawLinesOfText(ipsumLines, {
      y: size - 20,
      size: 20,
      font: 'Ubuntu-R',
      colorRgb: [101 / 255, 123 / 255, 131 / 255],
    }),
    drawLinesOfText(ipsumLines, {
      y: size - 105,
      size: 25,
      font: 'Fantasque-BI',
      colorRgb: [101 / 255, 123 / 255, 131 / 255],
    }),
    drawLinesOfText(ipsumLines, {
      y: size - 200,
      size: 25,
      font: 'IndieFlower-R',
      colorRgb: [101 / 255, 123 / 255, 131 / 255],
    }),
    drawLinesOfText(ipsumLines, {
      y: size - 300,
      size: 30,
      font: 'GreatVibes-R',
      colorRgb: [101 / 255, 123 / 255, 131 / 255],
    }),
    drawLinesOfText(ipsumLines, {
      y: size - 425,
      size: 25,
      font: 'AppleStorm-R',
      colorRgb: [101 / 255, 123 / 255, 131 / 255],
    }),
    drawLinesOfText(ipsumLines, {
      y: size - 500,
      size: 15,
      font: 'BioRhyme-R',
      colorRgb: [101 / 255, 123 / 255, 131 / 255],
    }),
    drawLinesOfText(ipsumLines, {
      y: size - 575,
      size: 15,
      font: 'PressStart2P-R',
      colorRgb: [101 / 255, 123 / 255, 131 / 255],
    }),
    drawLinesOfText(ipsumLines, {
      y: size - 650,
      size: 25,
      font: 'Hussar3D-R',
      colorRgb: [101 / 255, 123 / 255, 131 / 255],
    }),
  );

const makePage3ContentStream = (pdfDoc: PDFDocument, pageHeight: number) =>
  pdfDoc.createContentStream(
    // textRenderingMode('outlineAndClip'),
    // strokingRgbColor(0.5, 0.5, 0.5),
    // drawText('Unicornz!', {
    //   x: 75,
    //   y: pageHeight - 1080 * 0.2 + 75,
    //   font: '/Ubuntu-R',
    //   size: 50,
    // }),
    // clip(),
    // endPath(),
    drawImage('CatRidingUnicorn', {
      y: pageHeight - 1080 * 0.2,
      width: 1920 * 0.2,
      height: 1080 * 0.2,
    }),
    drawImage('MinionsLaughing', {
      y: pageHeight - 1080 * 0.2 - 354 * 0.75,
      width: 630 * 0.75,
      height: 354 * 0.75,
    }),
    drawImage('GreyscaleBird', {
      y: pageHeight - 1080 * 0.2 - 354 * 0.75 - 375 * 0.75,
      width: 600 * 0.75,
      height: 375 * 0.75,
    }),
    drawRectangle({
      width: 960 * 0.49,
      height: pageHeight - 1080 * 0.2 - 354 * 0.75 - 375 * 0.75,
      colorRgb: [0, 1, 0],
    }),
    drawImage('MinionsBananaAlpha', {
      y: pageHeight - 1080 * 0.2 - 354 * 0.75 - 375 * 0.75 - 640 * 0.5,
      width: 960 * 0.5,
      height: 640 * 0.5,
    }),
    drawImage('MinionsBananaNoAlpha', {
      // prettier-ignore
      y: pageHeight - 1080 * 0.2 - 354 * 0.75 - 375 * 0.75 - 640 * 0.5 - 640 * 0.5,
      width: 960 * 0.5,
      height: 640 * 0.5,
    }),
    drawImage('SmallMario', {
      // prettier-ignore
      y: pageHeight - 1080 * 0.2 - 354 * 0.75 - 375 * 0.75 - 640 * 0.5 - 640 * 0.5 - 1854 * 0.18,
      width: 1473 * 0.18,
      height: 1854 * 0.18,
    }),
  );

// Define the test kernel using the above content stream functions.
const kernel: ITestKernel = (assets: ITestAssets) => {
  const pdfDoc = PDFDocumentFactory.create();

  // Embed fonts:
  const { ttf, otf } = assets.fonts;

  const [FontUbuntuR] = pdfDoc.embedFont(ttf.ubuntu_r);
  const [FontBioRhymeR] = pdfDoc.embedFont(ttf.bio_rhyme_r);
  const [FontPressStart2PR] = pdfDoc.embedFont(ttf.press_start_2p_r);
  const [FontIndieFlowerR] = pdfDoc.embedFont(ttf.indie_flower_r);
  const [FontGreatVibesR] = pdfDoc.embedFont(ttf.great_vibes_r);

  const [FontFantasqueBI] = pdfDoc.embedFont(otf.fantasque_sans_mono_bi);
  const [FontAppleStormR] = pdfDoc.embedFont(otf.apple_storm_r);
  const [FontHussar3D] = pdfDoc.embedFont(otf.hussar_3d_r);

  const [FontTimesRoman] = pdfDoc.embedStandardFont('Times-Roman');

  // Embed images:
  const { jpg, png } = assets.images;

  const [JpgCatRidingUnicorn] = pdfDoc.embedJPG(jpg.cat_riding_unicorn);
  const [JpgMinionsLaughing] = pdfDoc.embedJPG(jpg.minions_laughing);

  const [PngGreyscaleBird] = pdfDoc.embedPNG(png.greyscale_bird);
  const [PngMinionsBananaAlpha] = pdfDoc.embedPNG(png.minions_banana_alpha);
  const [PngMinionsBananaNoAlpha] = pdfDoc.embedPNG(
    png.minions_banana_no_alpha,
  );
  const [PngSmallMario] = pdfDoc.embedPNG(png.small_mario);

  // Create pages:
  const page1Size = 750;
  const page1ContentStream = makePage1ContentStream(pdfDoc, page1Size);
  const page1ContentStreamRef = pdfDoc.register(page1ContentStream);

  const page1 = pdfDoc
    .createPage([page1Size, page1Size])
    .addFontDictionary('FontTimesRoman', FontTimesRoman)
    .addContentStreams(page1ContentStreamRef);

  const page2Size = 750;
  const page2ContentStream = makePage2ContentStream(pdfDoc, page2Size);
  const page2ContentStreamRef = pdfDoc.register(page2ContentStream);

  const page2 = pdfDoc
    .createPage([page2Size, page2Size])
    .addFontDictionary('Ubuntu-R', FontUbuntuR)
    .addFontDictionary('BioRhyme-R', FontBioRhymeR)
    .addFontDictionary('PressStart2P-R', FontPressStart2PR)
    .addFontDictionary('IndieFlower-R', FontIndieFlowerR)
    .addFontDictionary('GreatVibes-R', FontGreatVibesR)
    .addFontDictionary('Fantasque-BI', FontFantasqueBI)
    .addFontDictionary('AppleStorm-R', FontAppleStormR)
    .addFontDictionary('Hussar3D-R', FontHussar3D)
    .addContentStreams(page2ContentStreamRef);

  const page3Width = 750;
  const page3Height = 1750;
  const page3ContentStream = makePage3ContentStream(pdfDoc, page3Height);
  const page3ContentStreamRef = pdfDoc.register(page3ContentStream);

  const page3 = pdfDoc
    .createPage([page3Width, page3Height])
    .addFontDictionary('Ubuntu-R', FontUbuntuR)
    .addImageObject('CatRidingUnicorn', JpgCatRidingUnicorn)
    .addImageObject('MinionsLaughing', JpgMinionsLaughing)
    .addImageObject('GreyscaleBird', PngGreyscaleBird)
    .addImageObject('MinionsBananaAlpha', PngMinionsBananaAlpha)
    .addImageObject('MinionsBananaNoAlpha', PngMinionsBananaNoAlpha)
    .addImageObject('SmallMario', PngSmallMario)
    .addContentStreams(page3ContentStreamRef);

  // Add pages:
  pdfDoc.addPage(page1);
  pdfDoc.addPage(page2);
  pdfDoc.addPage(page3);

  return PDFDocumentWriter.saveToBytes(pdfDoc);
};

export default {
  kernel,
  title: 'PDF Creation Test (with operator helpers)',
  description:
    'This tests that the composite and simple operator helpers work.',
  checklist: [],
};
