import {
  drawImage,
  drawLinesOfText,
  drawRectangle,
  drawText,
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
      x: 100,
      y: 235,
      width: marioDims.width * 0.09,
      height: marioDims.height * 0.09,
    }),
    ...drawRectangle({
      x: 270,
      y: 280,
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
        x: 278,
        y: 342,
        colorRgb: [101 / 255, 123 / 255, 131 / 255],
        font: 'Ubuntu',
        size: 24,
      },
    ),
  );

const pageNumberContentStream = (
  pdfDoc: PDFDocument,
  idx: number,
  total: number,
) =>
  pdfDoc.register(
    pdfDoc.createContentStream(
      drawText(`${idx + 1} / ${total}`, {
        font: 'Helvetica',
        x: 10,
        y: 10,
        size: 17,
      }),
    ),
  );

// Define the test kernel using the above content stream functions.
const kernel: ITestKernel = (assets: ITestAssets) => {
  const pdfDoc = PDFDocumentFactory.load(
    assets.pdfs.with_newline_whitespace_in_indirect_object_numbers,
  );

  const [FontHelvetica] = pdfDoc.embedStandardFont('Helvetica');
  const [FontUbuntu] = pdfDoc.embedFont(assets.fonts.ttf.ubuntu_r);
  const [PngMario, marioDims] = pdfDoc.embedPNG(assets.images.png.small_mario);

  const pages = pdfDoc.getPages();

  const overlayContentStreamRef = pdfDoc.register(
    makeOverlayContentStream(pdfDoc, marioDims),
  );

  pages[0]
    .addFontDictionary('Ubuntu', FontUbuntu)
    .addXObject('Mario', PngMario)
    .addContentStreams(overlayContentStreamRef);

  pages.forEach((page, idx) => {
    page
      .addFontDictionary('Helvetica', FontHelvetica)
      .addContentStreams(pageNumberContentStream(pdfDoc, idx, pages.length));
  });

  return PDFDocumentWriter.saveToBytes(pdfDoc);
};

export default {
  kernel,
  title: 'PDF with Newline Whitespace in Indirect Object Numbers Test',
  description:
    'This tests that PDFs with ukranian text and newline whitespace in their indirect object numbers can be parsed and edited.\nhttps://github.com/Hopding/pdf-lib/pull/29',
  checklist: [
    'the PDF contains page numbers in the lower left corner of each page.',
    'the PDF has 21 pages.',
    'the PDF is an agile software development slide deck.',
    'the PDF contains ukranian text.',
    'an image of Mario running is drawn on the first slide.',
    'a box with solarized text is drawn to the right of Mario.',
  ],
};
