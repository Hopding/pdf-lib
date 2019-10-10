import fs from 'fs';
import { openPdf, Reader } from './open';

import { PDFDocument, rgb } from 'src/index';

(async () => {
  // SVG path for a wavy line
  const svgPath =
    'M 0,20 L 100,160 Q 130,200 150,120 C 190,-40 200,200 300,150 L 400,90';

  // Create a new PDFDocument
  const pdfDoc = await PDFDocument.create();

  // Add a blank page to the document
  const page = pdfDoc.addPage();
  page.moveTo(100, page.getHeight() - 5);

  // Draw the SVG path as a black line
  page.moveDown(25);
  page.drawSvgPath(svgPath);

  // Draw the SVG path as a thick green line
  page.moveDown(200);
  page.drawSvgPath(svgPath, { borderColor: rgb(0, 1, 0), borderWidth: 5 });

  // Draw the SVG path and fill it with red
  page.moveDown(200);
  page.drawSvgPath(svgPath, { color: rgb(1, 0, 0) });

  // Draw the SVG path at 50% of its original size
  page.moveDown(200);
  page.drawSvgPath(svgPath, { scale: 0.5 });

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();

  // For example, `pdfBytes` can be:
  //   • Written to a file in Node
  //   • Downloaded from the browser
  //   • Rendered in an <iframe>

  fs.writeFileSync('./out.pdf', pdfBytes);

  openPdf('./out.pdf', Reader.Preview);
})();
