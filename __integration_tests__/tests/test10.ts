import {
  drawImage,
  drawLinesOfText,
  drawRectangle,
  PDFDocument,
  PDFDocumentFactory,
  PDFDocumentWriter,
} from '../../src';

import PDFEmbeddedFontFactory from 'core/pdf-structures/factories/PDFEmbeddedFontFactory';
import { ITestAssets, ITestKernel } from '../models';

const makeOverlayContentStream = (
  pdfDoc: PDFDocument,
  marioDims: { width: number; height: number },
  { ubuntuFont }: { [key: string]: PDFEmbeddedFontFactory },
) =>
  pdfDoc.createContentStream(
    ...drawImage('Mario', {
      x: 200,
      y: 175,
      width: marioDims.width * 0.15,
      height: marioDims.height * 0.15,
    }),
    ...drawRectangle({
      x: 120,
      y: 65,
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
      ].map(ubuntuFont.encodeText),
      {
        x: 125,
        y: 125,
        colorRgb: [101 / 255, 123 / 255, 131 / 255],
        font: 'Ubuntu',
        size: 24,
      },
    ),
  );

// Define the test kernel using the above content stream functions.
const kernel: ITestKernel = (assets: ITestAssets) => {
  const pdfDoc = PDFDocumentFactory.load(assets.pdfs.with_comments);

  const [ubuntuRef, ubuntuFont] = pdfDoc.embedNonstandardFont(
    assets.fonts.ttf.ubuntu_r,
  );
  const [PngMario, marioDims] = pdfDoc.embedPNG(assets.images.png.small_mario);

  const pages = pdfDoc.getPages();

  const overlayContentStreamRef = pdfDoc.register(
    makeOverlayContentStream(pdfDoc, marioDims, { ubuntuFont }),
  );

  pages[0]
    .addFontDictionary('Ubuntu', ubuntuRef)
    .addXObject('Mario', PngMario)
    .addContentStreams(overlayContentStreamRef);

  return PDFDocumentWriter.saveToBytes(pdfDoc);
};

export default {
  kernel,
  title: 'PDF with Comments Test',
  description:
    'This tests that PDFs internal comments can be parsed and modified.\nhttps://github.com/Hopding/pdf-lib/issues/44\nhttps://github.com/Hopding/pdf-lib/pull/49',
  checklist: [
    'the PDF is an ND-1V North Dakota electronic return voucher form.',
    'the PDF is stamped with the year 2013.',
    'an image of Mario running is drawn on the bottom of the form.',
    'a box with solarized text is drawn underneath Mario.',
  ],
};
