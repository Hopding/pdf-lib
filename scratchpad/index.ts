import fs from 'fs';
import fetch from 'node-fetch';
import { openPdf, Reader } from './open';

import { degrees } from 'src/api/rotations';
import { PDFDocument } from 'src/index';

(async () => {
  const pdfDoc = await PDFDocument.create();

  const sourcePdfUrl =
    'https://pdf-lib.js.org/assets/with_large_page_count.pdf';
  const sourceBuffer = await fetch(sourcePdfUrl).then((res) =>
    res.arrayBuffer(),
  );
  const sourcePdfDoc = await PDFDocument.load(sourceBuffer);
  const sourcePdfPage = sourcePdfDoc.getPages()[73];

  const embeddedPage = await pdfDoc.embedPdfPage(
    sourcePdfPage,
    {
      // clip the PDF page to a certain area within the page
      left: 100,
      right: 450,
      bottom: 330,
      top: 570,
    },
    [1, 0, 0, 1, 10, 200], // translate by (10,200) units
  );
  const page = pdfDoc.addPage();

  page.drawEmbeddedPdfPage(embeddedPage, {
    x: 300,
    y: 100,
    xScale: 0.8,
    yScale: 0.8,
    rotate: degrees(30),
  });

  const pdfBytes = await pdfDoc.save();

  fs.writeFileSync('./out.pdf', pdfBytes);

  openPdf('./out.pdf', Reader.Preview);
})();
