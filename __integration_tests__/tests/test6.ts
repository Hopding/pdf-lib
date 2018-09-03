import range from 'lodash/range';

import {
  drawImage,
  drawLinesOfText,
  drawRectangle,
  drawText,
  PDFContentStream,
  PDFDocument,
  PDFDocumentFactory,
  PDFDocumentWriter,
  PDFPage,
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

const makeNewPageContentStream = (pdfDoc: PDFDocument) =>
  pdfDoc.createContentStream(
    ...drawText('This page was interleaved by pdf-lib!', {
      x: 45,
      y: 65,
      size: 24,
      font: 'Ubuntu',
      colorRgb: [0.7, 0.4, 0.9],
    }),
  );

// Define the test kernel using the above content stream functions.
const kernel: ITestKernel = (assets: ITestAssets) => {
  const pdfDoc = PDFDocumentFactory.load(assets.pdfs.with_large_page_count);

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

  const newPageContentStreamRef = pdfDoc.register(
    makeNewPageContentStream(pdfDoc),
  );

  // Interleave new pages between all existing ones
  range(pages.length).forEach((idx) => {
    const newPage = pdfDoc
      .createPage([500, 150])
      .addFontDictionary('Ubuntu', FontUbuntu)
      .addContentStreams(newPageContentStreamRef);
    pdfDoc.insertPage(2 * idx + 1, newPage);
  });

  return PDFDocumentWriter.saveToBytes(pdfDoc, { useObjectStreams: false });
};

export default {
  kernel,
  title: 'Large PDF Modification Test',
  description:
    'This tests that PDFs with large numbers of pages can be modified.',
  checklist: [
    'the document has 1,512 pages.',
    'the document contains the pages of the PDF 1.7 specification, interleaved with small, rectangular pages.',
    'the original specification pages contains a picture of Mario.',
    'beneath the pictures of Mario are boxes of solarized text.',
    'the small, rectangular pages contain lavendar text that says "This page was interleaved by pdf-lib!"',
  ],
};
