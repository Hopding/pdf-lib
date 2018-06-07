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
  drawRectangle,
  drawSquare,
} from 'core/pdf-operators/helpers/composite';

import { IPDFCreator, ITest, ITestAssets } from '../models';

const makePage1ContentStream = (
  pdfDoc: PDFDocument,
  width: number,
  height: number,
) =>
  PDFContentStream.of(
    PDFDictionary.from({}, pdfDoc.index),

    ...drawEllipse({
      x: 250,
      y: 500,
      xScale: 200,
      yScale: 200,
      // fillRgbColor: [0, 0, 255],
      // strokeRgbColor: [255, 0, 0],
    }),
  );

const kernel: IPDFCreator = (assets: ITestAssets) => {
  const pdfDoc = PDFDocumentFactory.create();

  const page1ContentStream = makePage1ContentStream(pdfDoc, 500, 1000);
  const page1ContentStreamRef = pdfDoc.register(page1ContentStream);
  const page1 = pdfDoc
    .createPage([500, 1000])
    .addContentStreams(page1ContentStreamRef);

  // _.forEach(Standard14Fonts, (font) => {
  //   page1.addFontDictionary(font, pdfDoc.embedStandardFont(font));
  // });

  pdfDoc.addPage(page1);

  return PDFDocumentWriter.saveToBytes(pdfDoc);
};

export default {
  kernel,
  title: 'PDF Modification Test (with Object Streams)',
  description: 'This is a test that does stuff and things.',
  checklist: ['Foo', 'Bar', 'Qux', 'Baz'],
};
