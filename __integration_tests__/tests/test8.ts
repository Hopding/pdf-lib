import round from 'lodash/round';
import sum from 'lodash/sum';

import {
  drawImage,
  drawLinesOfText,
  drawRectangle,
  drawText,
  PDFContentStream,
  PDFDocument,
  PDFDocumentFactory,
  PDFDocumentWriter,
  PDFNumber,
} from '../../src';

import { ITestAssets, ITestKernel } from '../models';

const createDonorPdf = () => {
  const pdfDoc = PDFDocumentFactory.create();
  const [FontHelvetica] = pdfDoc.embedStandardFont('Helvetica');

  const contentStream = pdfDoc.register(
    pdfDoc.createContentStream(
      drawText(`I am upside down!`, {
        font: 'Helvetica',
        x: 50,
        y: 225,
        size: 50,
      }),
    ),
  );
  const page = pdfDoc
    .createPage([500, 500])
    .addFontDictionary('Helvetica', FontHelvetica)
    .addContentStreams(contentStream);
  pdfDoc.addPage(page);

  pdfDoc.catalog.Pages.set('Rotate', PDFNumber.fromNumber(180));

  return pdfDoc;
};

const kernel: ITestKernel = (assets: ITestAssets) => {
  const pdfDoc = PDFDocumentFactory.load(
    assets.pdfs.with_missing_endstream_eol_and_polluted_ctm,
  );

  const [FontTimesRoman] = pdfDoc.embedStandardFont('Times-Roman');
  const [FontUbuntu] = pdfDoc.embedFont(assets.fonts.ttf.ubuntu_r);
  const [PngMario, marioDims] = pdfDoc.embedPNG(assets.images.png.small_mario);

  const allDonorPdfBytes: Uint8Array[] = [
    assets.pdfs.normal,
    assets.pdfs.with_update_sections,
    assets.pdfs.linearized_with_object_streams,
    assets.pdfs.with_large_page_count,
  ];

  allDonorPdfBytes.forEach((donorBytes) => {
    const donorPdf = PDFDocumentFactory.load(donorBytes);
    pdfDoc.addPage(donorPdf.getPages()[0]);
  });

  const anotherDonorPdf = createDonorPdf();
  pdfDoc.insertPage(1, anotherDonorPdf.getPages()[0]);

  const savedBytes = PDFDocumentWriter.saveToBytes(pdfDoc);

  const sizeOfAllDonorPdfs = sum(
    allDonorPdfBytes
      .concat(PDFDocumentWriter.saveToBytes(anotherDonorPdf))
      .map((bytes) => bytes.length),
  );
  const sizeOfCreatedPdf = savedBytes.length;

  console.log();
  console.log(
    'Since pdf-lib only copies the minimum necessary resources from a donor PDF needed to show a copied page, the size of the PDF we create from copied pages should be smaller than the size of all the donor PDFs added together:',
  );
  console.log();
  console.log(
    '  sizeOfRecipientPdf / sizeOfAllDonorPdfs = ',
    round(sizeOfCreatedPdf / sizeOfAllDonorPdfs, 2),
  );

  return savedBytes;
};

export default {
  kernel,
  title: 'Page Copying Test',
  description:
    'This tests that pages can be copied from donor PDFs into a receipient PDF.',
  checklist: [
    'the document contains 6 pages.',
    'the first page is a refund receipt.',
    'the second page is an inverted white square containing the text "I am upside down!".',
    'the third page is a D-2210 income tax form.',
    'the fourth page is a 2013, 1040-V tax form.',
    'the fifth page is a 2013, 1040 tax form title sheet.',
    'the sixth page is the title sheet of the PDF 1.7 specification.',
  ],
};
