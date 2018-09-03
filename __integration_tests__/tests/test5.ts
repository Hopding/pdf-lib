import flatMap from 'lodash/flatMap';

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
  Standard14Fonts,
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

const makeMiddlePageContentStream = (pdfDoc: PDFDocument, pageHeight: number) =>
  pdfDoc.createContentStream(
    ...flatMap(Standard14Fonts, (font, idx) =>
      drawText(`${idx + 1}. These are the 14 Standard Fonts.`, {
        x: 5,
        y: pageHeight - (idx + 1) * 20,
        size: 20,
        font,
        rotateRadians: -Math.PI / 6,
        skewRadians: { xAxis: Math.PI / 10, yAxis: Math.PI / 10 },
      }),
    ),
  );

// Define the test kernel using the above content stream functions.
const kernel: ITestKernel = (assets: ITestAssets) => {
  const pdfDoc = PDFDocumentFactory.load(assets.pdfs.normal);

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

  const middlePageContentStreamRef = pdfDoc.register(
    makeMiddlePageContentStream(pdfDoc, 500),
  );

  const middlePage = pdfDoc
    .createPage([600, 500])
    .addContentStreams(middlePageContentStreamRef);

  Standard14Fonts.forEach((font) => {
    const [fontRef] = pdfDoc.embedStandardFont(font);
    middlePage.addFontDictionary(font, fontRef);
  });

  pdfDoc.insertPage(1, middlePage);

  return PDFDocumentWriter.saveToBytes(pdfDoc);
};

export default {
  kernel,
  title: 'Basic PDF Modification Test',
  description: 'This tests that basic PDFs can be modified.',
  checklist: [
    'the document has 3 pages.',
    'the first and last pages constitute a "2012 D-2210" tax form.',
    'the first and last pages contain a picture of Mario.',
    'the first and last pages contains a box of solarized text beneath Mario.',
    'the middle page has 14 lines of text that say "These are the 14 Standard Fonts."',
    'the 14 lines of text are angled downwards and skewed to the right.',
    'each line of text is in a different font.',
    'the 4th and 8th fonts are symbolic non-latin fonts.',
  ],
};
