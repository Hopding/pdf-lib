import {
  drawImage,
  drawLinesOfText,
  drawRectangle,
  drawText,
  PDFContentStream,
  PDFDocument,
  PDFDocumentFactory,
  PDFDocumentWriter,
  StandardFonts,
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
    ...drawImage('Mario', {
      x: 200 + marioDims.width * 0.15,
      y: 375,
      width: marioDims.width * 0.15,
      height: marioDims.height * 0.15,
      rotateDegrees: 180,
      skewDegrees: { xAxis: 35, yAxis: 35 },
    }),
    ...drawRectangle({
      x: 120,
      y: 265,
      width: 400,
      height: 90,
      rotateDegrees: 10,
      skewDegrees: { xAxis: 0, yAxis: 15 },
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
        rotateDegrees: 10,
        skewDegrees: { xAxis: 0, yAxis: 15 },
        colorRgb: [101 / 255, 123 / 255, 131 / 255],
        font: 'Ubuntu',
        size: 24,
      },
    ),
  );

// Define the test kernel using the above content stream functions.
const kernel: ITestKernel = (assets: ITestAssets) => {
  const pdfDoc = PDFDocumentFactory.create();

  const [FontTimesRoman, TimesRomanFontData] = pdfDoc.embedStandardFont(
    StandardFonts.TimesRoman,
  );

  const strA = String.fromCharCode(
    402,
    8211,
    8212,
    8216,
    8217,
    8218,
    8220,
    8221,
    8222,
    8224,
    8225,
    8226,
    8230,
    8364,
    8240,
    8249,
    8250,
    710,
    8482,
    338,
    339,
    732,
    352,
    353,
    376,
    381,
    382,
  );
  const strB = 'Olé! - Œ - fl0@t';

  const widthA = TimesRomanFontData.widthOfTextAtSize(strA, 25);
  const heightA = TimesRomanFontData.heightOfTextAtSize(strA, 25);
  const widthB = TimesRomanFontData.widthOfTextAtSize(strB, 25);
  const heightB = TimesRomanFontData.heightOfTextAtSize(strB, 25);

  const contentStream = pdfDoc.register(
    pdfDoc.createContentStream(
      drawText(TimesRomanFontData.encodeText(strA), {
        font: 'Times-Roman',
        size: 25,
        x: 10,
        y: 400,
      }),
      drawRectangle({
        x: 10 - 1,
        y: 400 - 1,
        width: widthA + 2,
        height: heightA + 2,
        borderWidth: 1,
        borderColorRgb: [0.79, 0.25, 1.0],
      }),
      drawText(TimesRomanFontData.encodeText(strB), {
        font: 'Times-Roman',
        size: 25,
        x: 10,
        y: 350,
      }),
      drawRectangle({
        x: 10 - 1,
        y: 350 - 1,
        width: widthB + 2,
        height: heightB + 2,
        borderWidth: 1,
        borderColorRgb: [0.79, 0.25, 1.0],
      }),
    ),
  );

  const page = pdfDoc
    .createPage([650, 700])
    .addFontDictionary('Times-Roman', FontTimesRoman)
    .addContentStreams(contentStream);

  pdfDoc.addPage(page);

  return PDFDocumentWriter.saveToBytes(pdfDoc);
};

export default {
  kernel,
  title: 'PDF with Missing "endstream" EOL-Marker and Modified CTM Test',
  description:
    'This tests that PDFs with missing EOL markers before their "endstream" keywords and a modified CTM can be parsed and modified with the default CTM.\nhttps://github.com/Hopding/pdf-lib/issues/12',
  checklist: [
    // 'the background of the PDF is a WaveOC USA, Inc. refund receipt.',
    // 'an image of Mario running is drawn on top of the receipt.',
    // 'the same image of Mario is drawn upside down and skewed.',
    // 'a box with solarized text is drawn underneath Mario.',
    // 'this box of text is angled upwards and skewed to the right.',
  ],
};
