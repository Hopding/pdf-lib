
import {
  drawImage,
  drawLinesOfText,
  drawRectangle,
  PDFContentStream,
  PDFDocument,
  PDFDocumentFactory,
  PDFDocumentWriter,
} from '../../src';

import { ITestAssets, ITestKernel } from '../models';

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
    assets.pdfs.linearized_with_object_streams,
  );

  const [FontTimesRoman] = pdfDoc.embedStandardFont('Times-Roman');
  const [FontUbuntu] = pdfDoc.embedFont(assets.fonts.ttf.ubuntu_r);
  const [PngMario, marioDims] = pdfDoc.embedPNG(assets.images.png.small_mario);

  const pages = pdfDoc.getPages();

  const overlayContentStreamRef = pdfDoc.register(
    makeOverlayContentStream(pdfDoc, marioDims),
  );

  pages.forEach((page) => {
    page
      .addFontDictionary('Times-Roman', FontTimesRoman)
      .addFontDictionary('Ubuntu', FontUbuntu)
      .addXObject('Mario', PngMario)
      .addContentStreams(overlayContentStreamRef);
  });

  pdfDoc.removePage(1);

  return PDFDocumentWriter.saveToBytes(pdfDoc, { useObjectStreams: false });
};

export default {
  kernel,
  title: 'Linearized PDF Modification Test (with Object Streams)',
  description:
    'This tests that linearized PDFs with Object Streams can be modified.',
  checklist: [
    'the document has 205 pages.',
    'the document contains 1040 tax instructions from the IRS.',
    'each page of the document has a picture of Mario.',
    'each page of the document has two sentences of solarized theme text underneath Mario.',
    'the second page of the document is numbered "-3-" at the bottom.',
  ],
};
