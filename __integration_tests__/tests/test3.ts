import faker from 'faker';
import fs from 'fs';
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
  strokingRgbColor,
  text,
  textRenderingMode,
  translate,
} from 'core/pdf-operators/helpers/simple';

import { IPDFCreator, ITest, ITestAssets } from '../models';

// Define the test kernel using the above content stream functions.
const kernel: IPDFCreator = (assets: ITestAssets) => {
  const data = fs.readFileSync(
    '/Users/user/github/pdf-lib/test-pdfs/pdf/dc/inst/dc_ins_2210.pdf', // Normal
    // '/Users/user/github/pdf-lib/test-pdfs/pdf/fd/form/F1040V.pdf', // Updates
    // '/Users/user/github/pdf-lib/test-pdfs/pdf/ef/inst/ef_ins_1040.pdf', // Linearized & Object Streams
    // '/Users/user/Documents/PDF32000_2008.pdf', // Large pdf (page count)
  );
  const pdfDoc = PDFDocumentFactory.load(data);

  return PDFDocumentWriter.saveToBytes(pdfDoc);
};

export default {
  kernel,
  title: 'PDF Modification Test (with Object Streams)',
  description: 'This tests that PDFs with Object Streams can be modified.',
  checklist: [],
};
