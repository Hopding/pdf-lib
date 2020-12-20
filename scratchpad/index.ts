import fs from 'fs';
import { openPdf, Reader } from './open';
import { PDFDocument } from 'src/index';

(async () => {
  // Create a new PDFDocument
  const pdfDoc = await PDFDocument.create();

  // Set the title and include the new option.
  pdfDoc.setTitle('Scratchpad Test Doc', { showInWindowTitleBar: true });

  // Add a blank page to the document
  const page = pdfDoc.addPage([550, 750]);

  // Manual test...
  page.drawText(
    `The window's title should match what we set in the metadata.`,
    { x: 15, y: 400, size: 15 },
  );

  // Save the PDF
  const pdfBytes = await pdfDoc.save();

  fs.writeFileSync('out.pdf', pdfBytes);
  openPdf('out.pdf', Reader.Acrobat);
})();
