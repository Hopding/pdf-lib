import { Assets } from '../index.ts';

import { PDFDocument, StandardFonts } from '../../../dist/pdf-lib.esm.js';

export default async (assets: Assets) => {
  const pdfDoc = await PDFDocument.load(assets.pdfs.simple);
  const snapshot = pdfDoc.takeSnapshot();
  const page = pdfDoc.getPage(0);
  snapshot.markRefForSave(page.ref);
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontSize = 30;
  const { height } = page.getSize();
  page.drawText('Incremental saving is also awesome!', {
    x: 50,
    y: height - 8 * fontSize,
    size: fontSize,
    font: timesRomanFont,
  });

  const pdfIncrementalBytes = await pdfDoc.saveIncremental(snapshot);

  const pdfBytes = new Uint8Array([
    ...assets.pdfs.simple,
    ...pdfIncrementalBytes,
  ]);

  return pdfBytes;
};
