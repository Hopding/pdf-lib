import { PDFDocument, StandardFonts, degrees } from 'pdf-lib';

import { fetchAsset } from './assets';

const createDonorPdf = async () => {
  const pdfDoc = await PDFDocument.create();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const page = pdfDoc.addPage([500, 500]);

  page.moveTo(50, 225);
  page.setFont(helveticaFont);
  page.setFontSize(50);
  page.drawText('I am upside down!');
  page.setRotation(degrees(180));

  return pdfDoc;
};

export default async () => {
  const [
    withMissingEndstreamEolAndPollutedCtmBytes,
    normalBytes,
    withUpdateSectionsBytes,
    linearizedWithObjectStreamsBytes,
    withLargePageCountBytes,
  ] = await Promise.all([
    fetchAsset('pdfs/with_missing_endstream_eol_and_polluted_ctm.pdf'),
    fetchAsset('pdfs/normal.pdf'),
    fetchAsset('pdfs/with_update_sections.pdf'),
    fetchAsset('pdfs/linearized_with_object_streams.pdf'),
    fetchAsset('pdfs/with_large_page_count.pdf'),
  ]);

  const pdfDoc = await PDFDocument.load(
    withMissingEndstreamEolAndPollutedCtmBytes,
  );

  const allDonorPdfBytes = [
    normalBytes,
    withUpdateSectionsBytes,
    linearizedWithObjectStreamsBytes,
    withLargePageCountBytes,
  ];

  for (let idx = 0, len = allDonorPdfBytes.length; idx < len; idx++) {
    const donorBytes = allDonorPdfBytes[idx];
    const donorPdf = await PDFDocument.load(donorBytes);
    const [donorPage] = await pdfDoc.copyPages(donorPdf, [0]);
    pdfDoc.addPage(donorPage);
  }

  const anotherDonorPdf = await createDonorPdf();
  const [anotherDonorPage] = await pdfDoc.copyPages(anotherDonorPdf, [0]);
  pdfDoc.insertPage(1, anotherDonorPage);

  await pdfDoc.save();

  await anotherDonorPdf.save();
  for (let idx = 0, len = allDonorPdfBytes.length; idx < len; idx++) {
    allDonorPdfBytes[idx].length;
  }

  const base64Pdf = await pdfDoc.saveAsBase64({ dataUri: true });

  return { base64Pdf };

  // const pdfBytes = await pdfDoc.save();

  // const path = await writePdf(pdfBytes);

  // return { base64Pdf: `file://${path}` };
};
