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
  rg.of(255 / 256, 153 / 256, 51 / 256),
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
  k.of(100 / 256, 0, 0, 0),

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
  K.of(3 / 256, 200 / 256, 48 / 256, 21 / 256),
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

const kernel: IPDFCreator = (assets: ITestAssets) => {
  const pdfDoc = PDFDocumentFactory.create();

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

  const page1Size = 750;
  const page1ContentStream = makePage1ContentStream(pdfDoc, page1Size);
  const page1ContentStreamRef = pdfDoc.register(page1ContentStream);

  const page1 = pdfDoc
    .createPage([page1Size, page1Size])
    .addFontDictionary('FontTimesRoman', FontTimesRoman)
    .addContentStreams(page1ContentStreamRef);

  pdfDoc.addPage(page1);

  return PDFDocumentWriter.saveToBytes(pdfDoc);
};

export default {
  kernel,
  title: 'PDF Creation Test',
  description:
    `This test verifies that a PDF can be created from scratch.\n` +
    `It ensures that we can manipulate the PDF's pages, add fonts and images, ` +
    `and use all valid content stream operators.`,
  checklist: ['Foo', 'Bar', 'Qux', 'Baz'],
};
