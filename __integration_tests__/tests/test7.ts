import faker from 'faker';
import fs from 'fs';

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
  drawText,
  endPath,
  fillingRgbColor,
  fontAndSize,
  lineCap,
  lineHeight,
  lineJoin,
  lineTo,
  moveTo,
  nextLine,
  PDFArray,
  PDFContentStream,
  PDFDictionary,
  PDFDocument,
  PDFDocumentFactory,
  PDFDocumentWriter,
  PDFIndirectReference,
  PDFName,
  PDFPage,
  PDFTextObject,
  popGraphicsState,
  pushGraphicsState,
  scale,
  Standard14Fonts,
  strokingRgbColor,
  text,
  textRenderingMode,
  translate,
} from '../../src';

import { PDFOperators } from '../../src';

const { cm } = PDFOperators;

import { ITest, ITestAssets, ITestKernel } from '../models';

const makeOverlayContentStream = (
  pdfDoc: PDFDocument,
  marioDims: { width: number; height: number },
) =>
  pdfDoc.createContentStream(
    ...drawImage('Mario', {
      x: 200,
      y: 375,
      width: marioDims.width * 0.15,
      height: marioDims.height * 0.15,
    }),
    ...drawRectangle({
      x: 120,
      y: 265,
      width: 400,
      height: 90,
      colorRgb: [253 / 255, 246 / 255, 227 / 255],
      borderWidth: 3,
      borderColorRgb: [101 / 255, 123 / 255, 131 / 255],
    }),
    ...drawLinesOfText(
      [
        'This is an image of Mario running.',
        'This image and text was drawn on',
        'top of an existing PDF using pdf-lib!',
      ],
      {
        x: 125,
        y: 325,
        colorRgb: [101 / 255, 123 / 255, 131 / 255],
        font: 'Ubuntu',
        size: 24,
      },
    ),
  );

// Define the test kernel using the above content stream functions.
const kernel: ITestKernel = (assets: ITestAssets) => {
  const pdfDoc = PDFDocumentFactory.load(
    assets.pdfs.with_missing_endstream_eol_and_polluted_ctm,
  );

  const [FontTimesRoman] = pdfDoc.embedStandardFont('Times-Roman');
  const [FontUbuntu] = pdfDoc.embedFont(assets.fonts.ttf.ubuntu_r);
  const [PngMario, marioDims] = pdfDoc.embedPNG(assets.images.png.small_mario);

  const pages = pdfDoc.getPages();

  const overlayContentStreamRef = pdfDoc.register(
    makeOverlayContentStream(pdfDoc, marioDims),
  );

  pages[0]
    .addFontDictionary('Times-Roman', FontTimesRoman)
    .addFontDictionary('Ubuntu', FontUbuntu)
    .addXObject('Mario', PngMario)
    .addContentStreams(overlayContentStreamRef);

  return PDFDocumentWriter.saveToBytes(pdfDoc);
};

export default {
  kernel,
  title: 'PDF with Missing "endstream" EOL-Marker and Modified CTM Test',
  description:
    'This tests that PDFs with missing EOL markers before their "endstream" keywords and a modified CTM can be parsed and modified with the default CTM.\nhttps://github.com/Hopding/pdf-lib/issues/12',
  checklist: [
    'the background of the PDF is a WaveOC USA, Inc. refund receipt.',
    'an image of Mario running is drawn on top of the receipt.',
    'a box with solarized text is drawn underneath Mario.',
  ],
};
