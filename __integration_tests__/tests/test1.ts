import faker from 'faker';
import _ from 'lodash';

import PDFDocument from 'core/pdf-document/PDFDocument';
import PDFDocumentFactory from 'core/pdf-document/PDFDocumentFactory';
import PDFDocumentWriter from 'core/pdf-document/PDFDocumentWriter';
import { PDFDictionary, PDFName } from 'core/pdf-objects';
import PDFOperators from 'core/pdf-operators/index';
import PDFTextObject from 'core/pdf-operators/text/PDFTextObject';
import { PDFContentStream } from 'core/pdf-structures';
import PDFPage from 'core/pdf-structures/PDFPage';

import { IPDFCreator, ITest, ITestAssets } from '../models';

// Clipping path operators
const { W } = PDFOperators;

// Color operators
const { CS, cs, G, g, K, k, RG, rg, SCN, scn, SC, sc } = PDFOperators;

// Graphics state operators
const { cm, d, gs, i, J, j, M, Q, q, ri, w } = PDFOperators;

// Path construction operators
const { c, h, l, m, re, v, y } = PDFOperators;

// Path painting operators
const { S, s, F, f, B, b, n } = PDFOperators;

// Test positioning operators
const { T, TD, Td, Tm } = PDFOperators;

// Text showing operators
const { quote, TJ, Tj } = PDFOperators;

// Text state operators
const { Tc, Tf, TL, Tr, Ts, Tw, Tz } = PDFOperators;

// XObject operator
const { Do } = PDFOperators;

// Based on: http://spencermortensen.com/articles/bezier-circle/
//   P_0 = (0,1),  P_1 = (c,1),   P_2 = (1,c),   P_3 = (1,0)
//   P_0 = (1,0),  P_1 = (1,-c),  P_2 = (c,-1),  P_3 = (0,-1)
//   P_0 = (0,-1), P_1 = (-c,-1), P_3 = (-1,-c), P_4 = (-1,0)
//   P_0 = (-1,0), P_1 = (-1,c),  P_2 = (-c,1),  P_3 = (0,1)
//     with c = 0.551915024494
const makeBezierCircle = (
  xPos: number,
  yPos: number,
  xScale: number,
  yScale: number,
) => {
  const cVal = 0.551915024494;
  return [
    q.operator,
    cm.of(1, 0, 0, 1, xPos, yPos), // translate
    cm.of(xScale, 0, 0, yScale, 0, 0), // scale
    m.of(0, 1),
    c.of(cVal, 1, 1, cVal, 1, 0),
    c.of(1, -cVal, cVal, -1, 0, -1),
    c.of(-cVal, -1, -1, -cVal, -1, 0),
    c.of(-1, cVal, -cVal, 1, 0, 1),
    Q.operator,
  ];
};

const makeUpperLeftQuadrant = (size: number) => [
  // (1) ===== Draw red background in top-left quadrant of the page =====

  // Set the non-stroking color space to RGB.
  cs.of('/DeviceRGB'),
  // Use the color red for non-stroking operations.
  sc.of(1.0, 0.0, 0.0),

  // Construct a path of the top, right, and bottom sides of a square starting
  // at the top-left corner of the page.
  m.of(0, size),
  l.of(size, size),
  l.of(size, 0),
  l.of(0, 0),

  // Close (by drawing the left side of the square) and fill (using the
  // current non-stroking color) the current path
  f.operator,

  // (2) ===== Draw a yellow right angle in top-left quadrant of page =====

  // Set clipping path to include only the top and left sides of the rectangle
  m.of(0, size),
  l.of(0, 0),
  l.of(size, size),
  h.operator,
  W.operator,
  n.operator,

  // Set the stroking color space to RGB.
  CS.of('/DeviceRGB'),
  // Use the color yellow for stroking operations.
  SC.of(1.0, 1.0, 0.0),

  // Construct a rectangular path centered within the top-left quadrant.
  //   (Note: We use (0.5 * pageSize) here so that we work within the
  //         top-left quadrant, not the entire page.)
  re.of(0.25 * size, size - 0.75 * size, 0.5 * size, 0.5 * size),

  // Increase the line width
  w.of(50),

  // Stroke (outline) the current path
  S.operator,
];

const makeUpperRightQuadrant = (size: number) => [
  // (3) ===== Draw green background in top-right quadrant of the page =====

  // Use green (in the RGB color space) as the stroking color.
  rg.of(0.0, 1.0, 0.0),

  // Construct a path of the top, right, and bottom sides of a square for the
  // top-right quadrant of the page
  m.of(0, size),
  l.of(size, size),
  l.of(size, 0),
  l.of(0, 0),

  // Close (by drawing the left side of the square) and fill (using the
  // current non-stroking color) the current path.
  f.operator,

  // Draw an orange oval in center of upper-right quadrant.
  rg.of(255 / 255, 153 / 255, 51 / 255),
  ...makeBezierCircle(0.5 * size, 0.5 * size, 100, 150),
  f.operator,

  // Set clipping path to include a circular view of the following text
  // with an oval hole in the center to avoid covering up the orange oval
  // with text.
  ...makeBezierCircle(0.5 * size, 0.5 * size, 250, 350),
  ...makeBezierCircle(0.5 * size, 0.5 * size, 100, 150),
  W.asterisk.operator,
  n.operator,

  // Create a text object
  PDFTextObject.of(
    // Set text color to pink using RGB colorspace
    rg.of(1.0, 0.0, 1.0),

    // Use Times New Roman font, size 24
    Tf.of('/FontTimesRoman', 48),

    // Position the current text position to the upper-left corner of the
    // upper-right quadrant of the page.
    Td.of(5, size - 48),

    // Draw 15 lines of lorem ipsum text to fill the upper-right quadrant
    ..._.flatMap(_.range(15), () => [
      Tj.of(faker.lorem.sentence()),
      Td.of(0, -48),
    ]),
  ),
];

const makeLowerLeftQuadrant = (size: number) => [
  // (4) ===== Draw cyan background in bottom-left quadrant of the page =====

  // Use cyan (in the CMYK color space) as the stroking color.
  k.of(100 / 255, 0, 0, 0),

  // Construct a path of the top, right, and bottom sides of a square for
  // the bottom-left quadrant of the page.
  m.of(0, size),
  l.of(size, size),
  l.of(size, 0),
  l.of(0, 0),

  // Close (by drawing the left side of the square) and fill (using the
  // current non-stroking color) the current path.
  f.operator,

  // Cause a series of dashes to be painted when the path is stroked instead
  // of a single line.
  d.of([50], 50),

  // Cause the ends of stroked lines to be rounded instead of flat.
  J.of(1),

  // Increase the thickness of lines when they are stroked.
  w.of(30),

  // Draw a magenta oval in center of upper-right quadrant.
  K.of(3 / 255, 200 / 255, 48 / 255, 21 / 255),
  ...makeBezierCircle(0.5 * size, 0.5 * size, 300, 300),
  s.operator,
];

const makeLowerRightQuadrant = (size: number) => [
  // (5) ===== Draw gray background in bottom-right quadrant of the page =====

  // Use cyan (in the CMYK color space) as the stroking color.
  g.of(0.8),

  // Construct a path of the top, right, and bottom sides of a square for
  // the bottom-right quadrant of the page.
  m.of(0, size),
  l.of(size, size),
  l.of(size, 0),
  l.of(0, 0),

  // Close (by drawing the left side of the square) and fill (using the
  // current non-stroking color) the current path.
  f.operator,

  G.of(0.5),
  g.of(0.5),

  w.of(50),
  j.of(1),

  m.of(0.25 * size, 0.75 * size),
  l.of(0.75 * size, 0.75 * size),
  l.of(0.75 * size, 0.25 * size),
  l.of(0.25 * size, 0.25 * size),

  b.operator,

  G.of(1),
  g.of(0),

  j.of(2),

  m.of(0.35 * size, 0.65 * size),
  l.of(0.65 * size, 0.65 * size),
  l.of(0.65 * size, 0.35 * size),
  l.of(0.35 * size, 0.35 * size),

  b.operator,
];

const makePage1ContentStream = (pdfDoc: PDFDocument, pageSize: number) =>
  PDFContentStream.of(
    PDFDictionary.from({}, pdfDoc.index),

    q.operator,
    cm.of(1, 0, 0, 1, 0, 0.5 * pageSize), // translate
    cm.of(0.5, 0, 0, 0.5, 0, 0), // scale
    ...makeUpperLeftQuadrant(pageSize),
    Q.operator,

    q.operator,
    cm.of(1, 0, 0, 1, 0.5 * pageSize, 0.5 * pageSize), // translate
    cm.of(0.5, 0, 0, 0.5, 0, 0), // scale
    ...makeUpperRightQuadrant(pageSize),
    Q.operator,

    q.operator,
    cm.of(1, 0, 0, 1, 0, 0), // translate
    cm.of(0.5, 0, 0, 0.5, 0, 0), // scale
    ...makeLowerLeftQuadrant(pageSize),
    Q.operator,

    q.operator,
    cm.of(1, 0, 0, 1, 0.5 * pageSize, 0), // translate
    cm.of(0.5, 0, 0, 0.5, 0, 0), // scale
    ...makeLowerRightQuadrant(pageSize),
    Q.operator,
  );

const loremIpsumLines = [
  'Eligendi est pariatur quidem in non excepturi et.',
  'Consectetur non tenetur magnam est corporis tempor.',
  'Labore nisi officiis quia ipsum qui voluptatem omnis.',
];

const drawTextLines = (
  fontName: string,
  fontSize: number,
  lines: number,
  extraSpace = false,
) => [
  Tf.of(fontName, fontSize),
  ..._.flatMap(loremIpsumLines, (sentence) => [
    Tj.of(extraSpace ? sentence.replace(/\ /g, '   ') : sentence),
    Td.of(0, -fontSize),
  ]),
  Td.of(0, -25),
];

const makePage2ContentStream = (pdfDoc: PDFDocument, pageSize: number) =>
  PDFContentStream.of(
    PDFDictionary.from({}, pdfDoc.index),

    // Draw a tan background on the page
    rg.of(253 / 255, 246 / 255, 227 / 255),
    m.of(0, pageSize),
    l.of(pageSize, pageSize),
    l.of(pageSize, 0),
    l.of(0, 0),
    f.operator,

    // Create a text object
    PDFTextObject.of(
      // Position the current text position to the upper-left corner of the
      // upper-right quadrant of the page.
      Td.of(25, pageSize - 40),

      // Use a dark grey color when painting glyphs
      rg.of(101 / 255, 123 / 255, 131 / 255),

      ...drawTextLines('/Ubuntu-R', 20, 5),
      ...drawTextLines('/Fantasque-BI', 25, 5),
      ...drawTextLines('/IndieFlower-R', 25, 5),
      ...drawTextLines('/GreatVibes-R', 30, 5),
      ...drawTextLines('/AppleStorm-R', 25, 5),
      ...drawTextLines('/BioRhyme-R', 15, 5),
      ...drawTextLines('/PressStart2P-R', 15, 5),
      ...drawTextLines('/Hussar3D-R', 25, 5, true),
    ),
  );

const kernel: IPDFCreator = (assets: ITestAssets) => {
  const pdfDoc = PDFDocumentFactory.create();

  // Pull this out into some sort of "getDefaultFonts" helper
  const FontTimesRoman = pdfDoc.register(
    PDFDictionary.from(
      {
        Type: PDFName.from('Font'),
        Subtype: PDFName.from('Type1'),
        BaseFont: PDFName.from('Times-Roman'),
      },
      pdfDoc.index,
    ),
  );

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

  // Add pages:
  pdfDoc.addPage(page1);
  pdfDoc.addPage(page2);

  return PDFDocumentWriter.saveToBytes(pdfDoc);
};

export default {
  kernel,
  title: 'PDF Creation Test',
  description:
    `This test verifies that a PDF can be created from scratch.\n` +
    `It ensures that we can manipulate the PDF's pages, add fonts and images, ` +
    `and use all valid content stream operators.`,
  checklist: [
    'there is one page.',
    'the background color of the upper-left quadrant of page 1 is red.',
    'the upper-left quadrant of page 1 contains the left and top sides of a square, colored yellow.',
    'the upper-left quadrant of page 1 does NOT contain the right and bottom sides of the square.',
    'the background color of the upper-right quadrant of page 1 is green.',
    'the upper-right quadrant of page 1 contains a circular cutout of pink text.',
    'the upper-right quadrant of page 1 contains a centered orange oval that is NOT covered by text.',
    'the background color of the lower-left quadrant of page 1 is cyan.',
    'the lower-left quadrant of page 1 contains a circular formation of lines',
    'the lines are colored dark magenta.',
    'the lines are shaped like hot dogs, NOT rectangles.',
    'the background color of the lower-right quadrant of page 1 is light gray.',
    'the lower-right quadrant of page 1 contains a dark gray, centered, square.',
    'the square\'s corners are rounded, NOT sharp.',
    'the dark gray square contains a white square.',
    'the white square\'s edges are flat, NOT sharp.',
    'the white square contains a black square with sharp edges.',
  ],
};
