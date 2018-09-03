/* tslint:disable:no-unused-variable */
import faker from 'faker';
import flatMap from 'lodash/flatMap';
import range from 'lodash/range';

import PDFDocument from 'core/pdf-document/PDFDocument';
import PDFDocumentFactory from 'core/pdf-document/PDFDocumentFactory';
import PDFDocumentWriter from 'core/pdf-document/PDFDocumentWriter';
import { PDFDictionary, PDFName } from 'core/pdf-objects';
import PDFOperators from 'core/pdf-operators';
import PDFTextObject from 'core/pdf-operators/text/PDFTextObject';
import { PDFContentStream } from 'core/pdf-structures';
import PDFPage from 'core/pdf-structures/PDFPage';

import { ITestAssets, ITestKernel } from '../models';

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
const drawCircle = (
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
  // (1) ===== Draw a red background =====

  // Set the non-stroking color space to RGB.
  cs.of('DeviceRGB'),

  // Use the color red for non-stroking operations.
  sc.of(1.0, 0.0, 0.0),

  // Construct a path of the top, right, and bottom sides of a square starting
  // at the top-left corner of the quadrant.
  m.of(0, size),
  l.of(size, size),
  l.of(size, 0),
  l.of(0, 0),

  // Close (by drawing the left side of the square) and fill (using the
  // current non-stroking color) the current path.
  f.operator,

  // (2) ===== Draw a yellow right angle =====

  // Set clipping path to include only the top and left sides of the square.
  m.of(0, size),
  l.of(0, 0),
  l.of(size, size),
  h.operator,
  W.operator,
  n.operator,

  // Set the stroking color space to RGB.
  CS.of('DeviceRGB'),

  // Use the color yellow for stroking operations.
  SC.of(1.0, 1.0, 0.0),

  // Construct a rectangular path centered within this quadrant.
  re.of(0.25 * size, size - 0.75 * size, 0.5 * size, 0.5 * size),

  // Increase the line width.
  w.of(50),

  // Stroke (outline) the current path, thus drawing the right angle.
  S.operator,
];

const makeUpperRightQuadrant = (size: number) => [
  // (1) ===== Draw green background in top-right quadrant of the page =====

  // Use green (in the RGB color space) as the non-stroking color.
  rg.of(0.0, 1.0, 0.0),

  // Construct a path of the top, right, and bottom sides of a square for
  // this quadrant.
  m.of(0, size),
  l.of(size, size),
  l.of(size, 0),
  l.of(0, 0),

  // Close (by drawing the left side of the square) and fill (using the
  // current non-stroking color) the current path.
  f.operator,

  // Draw an orange oval in center of the quadrant
  rg.of(255 / 255, 153 / 255, 51 / 255),
  ...drawCircle(0.5 * size, 0.5 * size, 100, 150),
  f.operator,

  // Set clipping path to include a circular view of the following text
  // with an oval hole in the center to avoid covering up the orange oval
  // with text.
  ...drawCircle(0.5 * size, 0.5 * size, 250, 350),
  ...drawCircle(0.5 * size, 0.5 * size, 100, 150),
  W!.asterisk!.operator,
  n.operator,

  // Create a text object.
  PDFTextObject.of(
    // Set text color to pink using RGB colorspace.
    rg.of(1.0, 0.0, 1.0),

    // Use Times New Roman font, size 48.
    Tf.of('FontTimesRoman', 48),

    // Position the current text position to the upper-left corner of
    // this quadrant.
    Td.of(5, size - 48),

    // Draw 15 lines of lorem ipsum text to fill this quadrant with text.
    ...flatMap(range(15), () => [Tj.of(faker.lorem.sentence()), Td.of(0, -48)]),
  ),
];

const makeLowerLeftQuadrant = (size: number) => [
  // (1) ===== Draw cyan background  =====

  // Use cyan (in the CMYK color space) as the non-stroking color.
  k.of(100 / 255, 0, 0, 0),

  // Construct a path of the top, right, and bottom sides of a square for
  // this quadrant.
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

  // Draw a magenta oval in center of this quadrant.
  K.of(3 / 255, 200 / 255, 48 / 255, 21 / 255),
  ...drawCircle(0.5 * size, 0.5 * size, 300, 300),
  s.operator,
];

const makeLowerRightQuadrant = (size: number) => [
  // (1) ===== Draw gray background  =====

  // Use cyan (in the CMYK color space) as the non-stroking color.
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

  // (2) ===== Draw a nested square in darker grey =====
  G.of(0.5),
  g.of(0.5),

  w.of(50),
  j.of(1),

  m.of(0.25 * size, 0.75 * size),
  l.of(0.75 * size, 0.75 * size),
  l.of(0.75 * size, 0.25 * size),
  l.of(0.25 * size, 0.25 * size),

  b.operator,

  // (3) ===== Draw a nested-nested square in white =====
  G.of(1),
  g.of(0),

  j.of(2),

  m.of(0.35 * size, 0.65 * size),
  l.of(0.65 * size, 0.65 * size),
  l.of(0.65 * size, 0.35 * size),
  l.of(0.35 * size, 0.35 * size),

  b.operator,
];

// ===== Draw shapes in the four quadrants of the first page's content stream =====
const makePage1ContentStream = (pdfDoc: PDFDocument, pageSize: number) =>
  PDFContentStream.of(
    PDFDictionary.from({}, pdfDoc.index),

    // Draw shapes in upper-left quadrant.
    q.operator,
    cm.of(1, 0, 0, 1, 0, 0.5 * pageSize), // translate
    cm.of(0.5, 0, 0, 0.5, 0, 0), // scale
    ...makeUpperLeftQuadrant(pageSize),
    Q.operator,

    // Draw shapes in upper-right quadrant.
    q.operator,
    cm.of(1, 0, 0, 1, 0.5 * pageSize, 0.5 * pageSize), // translate
    cm.of(0.5, 0, 0, 0.5, 0, 0), // scale
    ...makeUpperRightQuadrant(pageSize),
    Q.operator,

    // Draw shapes in lower-left quadrant.
    q.operator,
    cm.of(1, 0, 0, 1, 0, 0), // translate
    cm.of(0.5, 0, 0, 0.5, 0, 0), // scale
    ...makeLowerLeftQuadrant(pageSize),
    Q.operator,

    // Draw shapes in lower-right quadrant.
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
  ...flatMap(loremIpsumLines, (sentence) => [
    Tj.of(extraSpace ? sentence.replace(/\ /g, '   ') : sentence),
    Td.of(0, -fontSize),
  ]),
  Td.of(0, -25),
];

// ===== Draw text in different fonts in the second page's content stream =====
const makePage2ContentStream = (pdfDoc: PDFDocument, pageSize: number) =>
  PDFContentStream.of(
    PDFDictionary.from({}, pdfDoc.index),

    // Draw a tan background on the page.
    rg.of(253 / 255, 246 / 255, 227 / 255),
    m.of(0, pageSize),
    l.of(pageSize, pageSize),
    l.of(pageSize, 0),
    l.of(0, 0),
    f.operator,

    // Create a text object.
    PDFTextObject.of(
      // Position the current text position to the upper-left corner of the page.
      Td.of(25, pageSize - 40),

      // Use a dark grey color when painting glyphs.
      rg.of(101 / 255, 123 / 255, 131 / 255),

      // Draw 8 paragraphs of text, each in a different font.
      ...drawTextLines('Ubuntu-R', 20, 5),
      ...drawTextLines('Fantasque-BI', 25, 5),
      ...drawTextLines('IndieFlower-R', 25, 5),
      ...drawTextLines('GreatVibes-R', 30, 5),
      ...drawTextLines('AppleStorm-R', 25, 5),
      ...drawTextLines('BioRhyme-R', 15, 5),
      ...drawTextLines('PressStart2P-R', 15, 5),
      ...drawTextLines('Hussar3D-R', 25, 5, true),
    ),
  );

const drawImage = (imageName: string, width: number, height: number) => [
  cm.of(1, 0, 0, 1, 0, -height), // translate
  q.operator,
  cm.of(width, 0, 0, height, 0, 0), // scale
  Do.of(imageName),
  Q.operator,
];

// ===== Draw text in different fonts in the second page's content stream =====
const makePage3ContentStream = (pdfDoc: PDFDocument, pageHeight: number) =>
  PDFContentStream.of(
    PDFDictionary.from({}, pdfDoc.index),

    // Move to top of page.
    cm.of(1, 0, 0, 1, 0, pageHeight), // translate

    // Draw three images below one another. Scaling them to fit on the page.
    ...drawImage('CatRidingUnicorn', 1920 * 0.2, 1080 * 0.2),
    ...drawImage('MinionsLaughing', 630 * 0.75, 354 * 0.75),
    ...drawImage('GreyscaleBird', 600 * 0.75, 375 * 0.75),

    // Draw a green background extending to bottom of the page to demo the
    // alpha layer of the following transparent PNGs.
    rg.of(0.0, 1.0, 0.0),
    m.of(0, 0),
    l.of(960 * 0.49, 0),
    l.of(960 * 0.49, -640 * 0.5 - 640 * 0.5 - 1854 * 0.18),
    l.of(0, -640 * 0.5 - 640 * 0.5 - 1854 * 0.18),
    f.operator,

    // Draw three images below one another. Scaling them to fit on the page.
    ...drawImage('MinionsBananaAlpha', 960 * 0.5, 640 * 0.5),
    ...drawImage('MinionsBananaNoAlpha', 960 * 0.5, 640 * 0.5),
    ...drawImage('SmallMario', 1473 * 0.18, 1854 * 0.18),
  );

// Define the test kernel using the above content stream functions.
const kernel: ITestKernel = (assets: ITestAssets) => {
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
    .addXObject('CatRidingUnicorn', JpgCatRidingUnicorn)
    .addXObject('MinionsLaughing', JpgMinionsLaughing)
    .addXObject('GreyscaleBird', PngGreyscaleBird)
    .addXObject('MinionsBananaAlpha', PngMinionsBananaAlpha)
    .addXObject('MinionsBananaNoAlpha', PngMinionsBananaNoAlpha)
    .addXObject('SmallMario', PngSmallMario)
    .addContentStreams(page3ContentStreamRef);

  // Add pages:
  pdfDoc.addPage(page1);
  pdfDoc.addPage(page2);
  pdfDoc.addPage(page3);

  return PDFDocumentWriter.saveToBytes(pdfDoc, { useObjectStreams: false });
};

export default {
  kernel,
  title: 'PDF Creation Test',
  description:
    `This test verifies that a PDF can be created from scratch.\n` +
    `It ensures that we can manipulate the PDF's pages, add fonts and images, ` +
    `and use valid content stream operators.`,
  checklist: [
    'there are three pages.',
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
    'the background color of page 2 is solarized (a dirty white).',
    'there are 8 paragraphs of text on page 2, each in a different font.',
    'the first paragraph is a normal Ubuntu font (no serifs).',
    'the second paragraph is a bolded, italicized, Fantasque font (no serifs).',
    'the third paragraph is a normal Indie Flower font (looks handwritten).',
    'the fourth paragraph is a normal Great Vibes font (looks like cursive).',
    'the fifth paragraph is a bolded Apple Storm font (looks handwritten).',
    'the sixth paragraph is a normal Bio Rhyme font (wide characters with serifs). It runs off the page.',
    'the seventh paragraph is a bolded Press Start 2P font (looks pixelated). It runs off the page.',
    'the eigth paragraph is a normal Hussar 3D font (it looks 3D). It runs off the page.',
    'the third page contains six images.',
    'the first image is of a cat riding a unicorn breathing fire.',
    'the second image is of two laughing minions.',
    'the third image is a greyscale picture of a bird.',
    'the fourth image is of two minions with one holding a banana. The background color of this image is green.',
    'the fifth image is the same as the previous one, but with a white background.',
    'the sixth image is a picture of Mario, with a green background.',
  ],
};
