import fs from 'fs';
import { openPdf, Reader } from './open';

import { PDFDocument } from 'src/index';

(async () => {
  // These should be Uint8Arrays or ArrayBuffers
  // This data can be obtained in a number of different ways
  // If your running in a Node environment, you could use fs.readFile()
  // In the browser, you could make a fetch() call and use res.arrayBuffer()
  const americanFlagPdfBytes = fs.readFileSync('assets/pdfs/american_flag.pdf');
  const usConstitutionPdfBytes = fs.readFileSync(
    'assets/pdfs/us_constitution.pdf',
  );

  // Create a new PDFDocument
  const pdfDoc = await PDFDocument.create();

  // Embed the American flag PDF bytes
  const [americanFlag] = await pdfDoc.embedPdf(americanFlagPdfBytes);

  // Load the U.S. constitution PDF bytes
  const usConstitutionPdf = await PDFDocument.load(usConstitutionPdfBytes);

  // Embed the second page of the constitution and clip the preamble
  const preamble = await pdfDoc.embedPage(usConstitutionPdf.getPages()[1], {
    left: 55,
    bottom: 485,
    right: 300,
    top: 575,
  });

  // Get the width/height of the American flag PDF scaled down to 30% of
  // its original size
  const americanFlagDims = americanFlag.scale(0.3);

  // Get the width/height of the preamble clipping scaled up to 225% of
  // its original size
  const preambleDims = preamble.scale(2.25);

  // Add a blank page to the document
  const page = pdfDoc.addPage();

  // Draw the American flag image in the center top of the page
  page.drawPage(americanFlag, {
    ...americanFlagDims,
    x: page.getWidth() / 2 - americanFlagDims.width / 2,
    y: page.getHeight() - americanFlagDims.height - 150,
  });

  // Draw the preamble clipping in the center bottom of the page
  page.drawPage(preamble, {
    ...preambleDims,
    x: page.getWidth() / 2 - preambleDims.width / 2,
    y: page.getHeight() / 2 - preambleDims.height / 2 - 50,
  });

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();

  // For example, `pdfBytes` can be:
  //   • Written to a file in Node
  //   • Downloaded from the browser
  //   • Rendered in an <iframe>

  fs.writeFileSync('./out.pdf', pdfBytes);

  openPdf('./out.pdf', Reader.Preview);
})();
