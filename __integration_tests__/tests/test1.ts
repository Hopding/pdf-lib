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

// W*, f*, B*, b*, T*, ', "

const makePage1ContentStream = (pdfDoc: PDFDocument, pageSize: number) =>
  PDFContentStream.of(
    PDFDictionary.from({}, pdfDoc.index),
    // (1) ===== Draw red background in top-left quadrant of the page =====

    // Set the non-stroking color space to RGB.
    cs.of('/DeviceRGB'),
    // Use the color red for non-stroking operations.
    sc.of(1.0, 0.0, 0.0),

    // Construct a path of the top, right, and bottom sides of a square starting
    // at the top-left corner of the page.
    m.of(0, pageSize),
    l.of(pageSize / 2, pageSize),
    l.of(pageSize / 2, pageSize / 2),
    l.of(0, pageSize / 2),

    // Close (by drawing the left side of the square) and fill (using the
    // current non-stroking color) the current path
    f.operator,

    // (2) ===== Draw a yellow right angle in top-left quadrant of page =====

    // Set clipping path to include only the top and left sides of the rectangle
    m.of(0, pageSize),
    l.of(0, 0.5 * pageSize),
    l.of(0.5 * pageSize, pageSize),
    h.operator,
    W.operator,
    n.operator,

    // Set the stroking color space to RGB.
    CS.of('/DeviceRGB'),
    // Use the color yellow for stroking operations.
    SC.of(1.0, 1.0, 0.0),

    // Construct a rectangular centered within the top-left quadrant.
    //   (Note: We use (0.5 * pageSize) here so that we work within the
    //         top-left quadrant, not the entire page.)
    re.of(
      0.25 * (0.5 * pageSize),
      pageSize - 0.75 * (0.5 * pageSize),
      0.5 * (0.5 * pageSize),
      0.5 * (0.5 * pageSize),
    ),

    // Increase the line width
    w.of(50),

    // Stroke (outline) the current path
    S.operator,

    PDFTextObject.of(
      // Draw red colored text at x-y coordinates (50, 500)
      rg.of(1.0, 0.0, 0.0),
      Tf.of('/FontTimesRoman', 50),
      Td.of(20, 20),
      Tj.of('This Is A Test Of The...'),
    ),
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
