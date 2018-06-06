import faker from 'faker';
import _ from 'lodash';

import PDFDocument, { Standard14Fonts } from 'core/pdf-document/PDFDocument';
import PDFDocumentFactory from 'core/pdf-document/PDFDocumentFactory';
import PDFDocumentWriter from 'core/pdf-document/PDFDocumentWriter';
import { PDFDictionary, PDFIndirectReference, PDFName } from 'core/pdf-objects';
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

const makePage1ContentStream = (
  pdfDoc: PDFDocument,
  width: number,
  height: number,
) =>
  PDFContentStream.of(
    PDFDictionary.from({}, pdfDoc.index),

    PDFTextObject.of(
      rg.of(0, 0, 0),
      Td.of(25, height - 50),

      ..._.flatMap(Standard14Fonts, (font) => [
        Tf.of(`/${font}`, 20),
        Tj.of('Stuff and Things and Wordz.'),
        Td.of(0, -20),
      ]),
    ),
  );

const kernel: IPDFCreator = (assets: ITestAssets) => {
  const pdfDoc = PDFDocumentFactory.create();

  const page1ContentStream = makePage1ContentStream(pdfDoc, 500, 1000);
  const page1ContentStreamRef = pdfDoc.register(page1ContentStream);
  const page1 = pdfDoc
    .createPage([500, 1000])
    .addContentStreams(page1ContentStreamRef);

  _.forEach(Standard14Fonts, (font) => {
    page1.addFontDictionary(font, pdfDoc.embedStandardFont(font));
  });

  pdfDoc.addPage(page1);

  return PDFDocumentWriter.saveToBytes(pdfDoc);
};

export default {
  kernel,
  title: 'PDF Modification Test (with Object Streams)',
  description: 'This is a test that does stuff and things.',
  checklist: ['Foo', 'Bar', 'Qux', 'Baz'],
};
