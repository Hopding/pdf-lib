
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

const makeNewPageContentStream = (
  pdfDoc: PDFDocument,
  catUnicornDims: { width: number; height: number },
) =>
  pdfDoc.createContentStream(
    ...drawText('This is the new first page!', {
      x: 5,
      y: 200,
      size: 24,
      font: 'Helvetica-Bold',
      colorRgb: [1, 0, 1],
    }),
    ...drawImage('CatUnicorn', {
      x: 30,
      y: 30,
      width: catUnicornDims.width * 0.13,
      height: catUnicornDims.height * 0.13,
    }),
  );

const makeLastPageContentStream = (pdfDoc: PDFDocument) =>
  pdfDoc.createContentStream(
    ...drawText('This is the last page!', {
      x: 30,
      y: 60,
      size: 24,
      font: 'Helvetica-Bold',
      colorRgb: [1, 0, 1],
    }),
    ...drawRectangle({
      x: 30,
      y: 50,
      width: 245,
      height: 5,
      colorRgb: [1, 0, 1],
    }),
  );

// Define the test kernel using the above content stream functions.
const kernel: ITestKernel = (assets: ITestAssets) => {
  const pdfDoc = PDFDocumentFactory.load(assets.pdfs.with_update_sections);

  const [FontTimesRoman] = pdfDoc.embedStandardFont('Times-Roman');
  const [FontHelveticaBold] = pdfDoc.embedStandardFont('Helvetica-Bold');
  const [FontUbuntu] = pdfDoc.embedFont(assets.fonts.ttf.ubuntu_r);

  const [PngMario, marioDims] = pdfDoc.embedPNG(assets.images.png.small_mario);
  const [JpgCatUnicorn, catUnicornDims] = pdfDoc.embedJPG(
    assets.images.jpg.cat_riding_unicorn,
  );

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
    makeNewPageContentStream(pdfDoc, catUnicornDims),
  );

  const newPage = pdfDoc
    .createPage([305, 250])
    .addFontDictionary('Helvetica-Bold', FontHelveticaBold)
    .addXObject('CatUnicorn', JpgCatUnicorn)
    .addContentStreams(newPageContentStreamRef);

  pdfDoc.insertPage(0, newPage);

  const lastPageContentStreamRef = pdfDoc.register(
    makeLastPageContentStream(pdfDoc),
  );

  const lastPage = pdfDoc
    .createPage([305, 125])
    .addFontDictionary('Helvetica-Bold', FontHelveticaBold)
    .addContentStreams(lastPageContentStreamRef);

  pdfDoc.addPage(lastPage);

  return PDFDocumentWriter.saveToBytes(pdfDoc);
};

export default {
  kernel,
  title: 'Updated PDF Modification Test',
  description: 'This tests that PDFs with update sections can be modified.',
  checklist: [
    'the document has 3 pages.',
    'the first page has the following pink test: "This is the new first page!"',
    'the first page has a picture of a cat riding a unicorn breathing fire.',
    'the first page is a small square, smaller than the second page.',
    'the second page is a "2013 Form 1040-V" tax form.',
    'the second page does not contain any boxes with an "X" in them serving as placeholders (if it does, the update section was lost).',
    'the second page contains a picture of mario.',
    'the second page contains a box of solarized text underneath mario.',
    'the third page is a small rectangle.',
    'the third page has the following underlined, pink text: "This is the last page!"',
  ],
};
