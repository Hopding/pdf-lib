import faker from 'faker';
import _ from 'lodash';

import PDFDocument from 'core/pdf-document/PDFDocument';
import PDFDocumentFactory from 'core/pdf-document/PDFDocumentFactory';
import PDFDocumentWriter from 'core/pdf-document/PDFDocumentWriter';
import Standard14Fonts from 'core/pdf-document/Standard14Fonts';
import { PDFDictionary, PDFIndirectReference, PDFName } from 'core/pdf-objects';
import PDFTextObject from 'core/pdf-operators/text/PDFTextObject';
import { PDFContentStream } from 'core/pdf-structures';
import PDFPage from 'core/pdf-structures/PDFPage';

import {
  drawCircle,
  drawEllipse,
  drawImage,
  drawLinesOfText,
  drawRectangle,
  drawSquare,
  drawText,
} from 'core/pdf-operators/helpers/composite';
import {
  clip,
  clipEvenOdd,
  closePath,
  dashPattern,
  endPath,
  fillingRgbColor,
  fontAndSize,
  lineCap,
  lineHeight,
  lineJoin,
  lineTo,
  moveTo,
  nextLine,
  popGraphicsState,
  pushGraphicsState,
  scale,
  text,
  translate,
} from 'core/pdf-operators/helpers/simple';

import PDFOperators from 'core/pdf-operators';
const { T, TD, Td, Tm } = PDFOperators;

import { IPDFCreator, ITest, ITestAssets } from '../models';

const ipsumLines = [
  'Eligendi est pariatur quidem in non excepturi et.',
  'Consectetur non tenetur magnam est corporis tempor.',
  'Labore nisi officiis quia ipsum qui voluptatem omnis.',
];

const makePage1ContentStream = (pdfDoc: PDFDocument, size: number) =>
  PDFContentStream.of(
    PDFDictionary.from({}, pdfDoc.index),

    // Upper-left quadrant
    pushGraphicsState(),
    translate(0, size / 2),
    ...drawSquare({
      size: size / 2,
      fillRgbColor: [1, 0, 0],
    }),
    moveTo(0, size / 2),
    lineTo(0, 0),
    lineTo(size / 2, size / 2),
    closePath(),
    clip(),
    endPath(),
    ...drawSquare({
      x: size / 8,
      y: size / 8,
      size: size / 4,
      borderWidth: 50,
      borderRgbColor: [1, 1, 0],
    }),
    popGraphicsState(),

    // Upper-right quadrant
    pushGraphicsState(),
    translate(size / 2, size / 2),
    ...drawSquare({
      size: size / 2,
      fillRgbColor: [0, 1, 0],
    }),
    ...drawEllipse({
      x: size / 4,
      y: size / 4,
      xScale: 50,
      yScale: 75,
      fillRgbColor: [255 / 255, 153 / 255, 51 / 255],
    }),
    ...drawEllipse({
      x: size / 4,
      y: size / 4,
      xScale: 50,
      yScale: 75,
    }),
    ...drawEllipse({
      x: size / 4,
      y: size / 4,
      xScale: 100,
      yScale: 150,
    }),
    clipEvenOdd(),
    endPath(),
    ...drawLinesOfText(
      [...ipsumLines, ...ipsumLines, ...ipsumLines, ...ipsumLines],
      {
        x: 5,
        y: size / 2 - 5 - 25,
        font: '/FontTimesRoman',
        size: 32,
        fillRgbColor: [1, 0, 1],
      },
    ),
    popGraphicsState(),

    // Lower-left quadrant
    pushGraphicsState(),
    translate(0, 0),
    ...drawSquare({
      size: size / 2,
      fillRgbColor: [0, 1, 1],
    }),
    dashPattern([25], 25),
    lineCap(1),
    ...drawCircle({
      x: size / 4,
      y: size / 4,
      size: 150,
      borderWidth: 10,
      borderRgbColor: [0.9, 0, 0.9],
    }),
    popGraphicsState(),

    // Lower-right quadrant
    pushGraphicsState(),
    translate(size / 2, 0),
    ...drawSquare({
      size: size / 2,
      fillRgbColor: [0.8, 0.8, 0.8],
    }),
    // lineWidth()
    lineJoin(1),
    ...drawSquare({
      x: 50,
      y: 50,
      size: size / 2 - 2 * 50,
      borderRgbColor: [0.6, 0.6, 0.6],
      borderWidth: 15,
    }),
    lineJoin(2),
    ...drawSquare({
      x: 100,
      y: 100,
      size: size / 2 - 2 * 100,
      fillRgbColor: [1, 1, 1],
      borderRgbColor: [0, 0, 0],
      borderWidth: 15,
    }),
    popGraphicsState(),
  );

// Define the test kernel using the above content stream functions.
const kernel: IPDFCreator = (assets: ITestAssets) => {
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

  const FontTimesRoman = pdfDoc.embedStandardFont('Times-Roman');

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

  // const page2Size = 750;
  // const page2ContentStream = makePage2ContentStream(pdfDoc, page2Size);
  // const page2ContentStreamRef = pdfDoc.register(page2ContentStream);
  //
  // const page2 = pdfDoc
  //   .createPage([page2Size, page2Size])
  //   .addFontDictionary('Ubuntu-R', FontUbuntuR)
  //   .addFontDictionary('BioRhyme-R', FontBioRhymeR)
  //   .addFontDictionary('PressStart2P-R', FontPressStart2PR)
  //   .addFontDictionary('IndieFlower-R', FontIndieFlowerR)
  //   .addFontDictionary('GreatVibes-R', FontGreatVibesR)
  //   .addFontDictionary('Fantasque-BI', FontFantasqueBI)
  //   .addFontDictionary('AppleStorm-R', FontAppleStormR)
  //   .addFontDictionary('Hussar3D-R', FontHussar3D)
  //   .addContentStreams(page2ContentStreamRef);
  //
  // const page3Width = 750;
  // const page3Height = 1750;
  // const page3ContentStream = makePage3ContentStream(pdfDoc, page3Height);
  // const page3ContentStreamRef = pdfDoc.register(page3ContentStream);
  //
  // const page3 = pdfDoc
  //   .createPage([page3Width, page3Height])
  //   .addXObject('CatRidingUnicorn', JpgCatRidingUnicorn)
  //   .addXObject('MinionsLaughing', JpgMinionsLaughing)
  //   .addXObject('GreyscaleBird', PngGreyscaleBird)
  //   .addXObject('MinionsBananaAlpha', PngMinionsBananaAlpha)
  //   .addXObject('MinionsBananaNoAlpha', PngMinionsBananaNoAlpha)
  //   .addXObject('SmallMario', PngSmallMario)
  //   .addContentStreams(page3ContentStreamRef);

  // Add pages:
  pdfDoc.addPage(page1);
  // pdfDoc.addPage(page2);
  // pdfDoc.addPage(page3);

  return PDFDocumentWriter.saveToBytes(pdfDoc);
};

export default {
  kernel,
  title: 'PDF Modification Test (with Object Streams)',
  description: 'This is a test that does stuff and things.',
  checklist: ['Foo', 'Bar', 'Qux', 'Baz'],
};
