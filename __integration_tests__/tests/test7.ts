import {
  drawImage,
  drawLinesOfText,
  drawRectangle,
  PDFContentStream,
  PDFDocument,
  PDFDocumentFactory,
  PDFDocumentWriter,
  PDFNumber,
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
  // const allPdfs = shuffle(Object.values(assets.pdfs));
  //
  // const doneePdfBytes = allPdfs[0];
  // const donorPdfsBytes = allPdfs.slice(1);
  //
  // const pdfDoc = PDFDocumentFactory.load(doneePdfBytes);
  //
  // const [FontTimesRoman] = pdfDoc.embedStandardFont('Times-Roman');
  // const [FontUbuntu] = pdfDoc.embedFont(assets.fonts.ttf.ubuntu_r);
  // const [PngMario, marioDims] = pdfDoc.embedPNG(assets.images.png.small_mario);
  //
  // const pages = pdfDoc.getPages();
  //
  // const overlayContentStreamRef = pdfDoc.register(
  //   makeOverlayContentStream(pdfDoc, marioDims),
  // );
  //
  // pages[0]
  //   .addFontDictionary('Times-Roman', FontTimesRoman)
  //   .addFontDictionary('Ubuntu', FontUbuntu)
  //   .addXObject('Mario', PngMario)
  //   .addContentStreams(overlayContentStreamRef);
  //
  // for (const donorBytes of donorPdfsBytes) {
  //   const donorPdf = PDFDocumentFactory.load(donorBytes);
  //   const donorPages = donorPdf.getPages();
  //   const firstDonorPage = donorPages[0];
  //   pdfDoc.addPage(firstDonorPage);
  // }
  //
  // return PDFDocumentWriter.saveToBytes(pdfDoc);

  // const donorPdf = PDFDocumentFactory.load(
  //   assets.pdfs.with_missing_endstream_eol_and_polluted_ctm,
  // );
  // const pdfDoc = PDFDocumentFactory.load(assets.pdfs.normal);

  // const donorPdf = PDFDocumentFactory.load(assets.pdfs.normal);
  // const pdfDoc = PDFDocumentFactory.load(
  // assets.pdfs.with_missing_endstream_eol_and_polluted_ctm,
  // );

  // const fs = require('fs');
  // const donorPdf = PDFDocumentFactory.load(fs.readFileSync('/Users/user/github/pdf-lib/test-pdfs/minimal.pdf'));
  // const pdfDoc = PDFDocumentFactory.load(
  // assets.pdfs.with_missing_endstream_eol_and_polluted_ctm,
  // );

  const donorPdf = PDFDocumentFactory.create();
  const [FontHelvetica] = donorPdf.embedStandardFont('Helvetica');
  donorPdf.addPage(
    donorPdf
      .createPage([500, 500])
      .addFontDictionary('Helvetica', FontHelvetica)
      .addContentStreams(
        donorPdf.register(
          donorPdf.createContentStream(
            drawLinesOfText(['Foo', 'Bar'], {
              font: 'Helvetica',
              x: 25,
              y: 200,
              size: 25,
            }),
          ),
        ),
      ),
  );
  donorPdf.catalog.Pages.set('Rotate', PDFNumber.fromNumber(180));

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

  const donorPages = donorPdf.getPages();
  const firstDonorPage = donorPages[0];
  // pdfDoc.addPage(firstDonorPage);
  pdfDoc.insertPage(0, firstDonorPage);

  // return PDFDocumentWriter.saveToBytes(pdfDoc);
  return PDFDocumentWriter.saveToBytes(pdfDoc, { useObjectStreams: false });
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
