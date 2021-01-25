import fs from 'fs';
import { openPdf, Reader } from './open';
import { PDFDocument } from 'src/index';

(async () => {
  // This should be a Uint8Array or ArrayBuffer
  // This data can be obtained in a number of different ways
  // If your running in a Node environment, you could use fs.readFile()
  // In the browser, you could make a fetch() call and use res.arrayBuffer()
  const existingPdfBytes = fs.readFileSync('assets/pdfs/with_viewer_prefs.pdf');

  // Load a PDFDocument without updating its existing metadata
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const viewerPrefs = pdfDoc.catalog.getOrCreateViewerPreferences();

  // Print all available viewer preference fields
  console.log('HideToolbar:', viewerPrefs.getHideToolbar());
  console.log('HideMenubar:', viewerPrefs.getHideMenubar());
  console.log('HideWindowUI:', viewerPrefs.getHideWindowUI());
  console.log('FitWindow:', viewerPrefs.getFitWindow());
  console.log('CenterWindow:', viewerPrefs.getCenterWindow());
  console.log('DisplayDocTitle:', viewerPrefs.getDisplayDocTitle());
  console.log('NonFullScreenPageMode:', viewerPrefs.getNonFullScreenPageMode());
  console.log('ReadingDirection:', viewerPrefs.getReadingDirection());
  console.log('PrintScaling:', viewerPrefs.getPrintScaling());
  console.log('Duplex:', viewerPrefs.getDuplex());
  console.log('PickTrayByPDFSize:', viewerPrefs.getPickTrayByPDFSize());
  console.log('PrintPageRange:', viewerPrefs.getPrintPageRange());
  console.log('NumCopies:', viewerPrefs.getNumCopies());

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();

  // For example, `pdfBytes` can be:
  //   • Written to a file in Node
  //   • Downloaded from the browser
  //   • Rendered in an <iframe>

  fs.writeFileSync('out.pdf', pdfBytes);
  openPdf('out.pdf', Reader.Preview);
})();
