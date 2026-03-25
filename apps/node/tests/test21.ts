import fontkit from '@pdf-lib/fontkit';
import { Assets } from '..';
import { PDFDocument, rgb, StandardFonts } from '../../..';

// This test verifies the commit() method for chained incremental updates.
// It creates a PDF, performs multiple incremental saves with commits,
// and verifies the document remains valid with proper XREF chain.
export default async (assets: Assets) => {
  // Create initial PDF with first page
  const pdfDoc = await PDFDocument.create({ updateMetadata: false });
  pdfDoc.registerFontkit(fontkit);

  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  const page1 = pdfDoc.addPage([612, 792]);
  page1.drawText('Page 1 - Initial Creation', {
    x: 50,
    y: 700,
    size: 24,
    font: timesRoman,
    color: rgb(0, 0, 0),
  });

  // First save - establish baseline
  const initialBytes = await pdfDoc.save();

  // Reload with forIncrementalUpdate: true (required for commit())
  const pdfDoc2 = await PDFDocument.load(initialBytes, {
    updateMetadata: false,
    forIncrementalUpdate: true,
  });
  pdfDoc2.registerFontkit(fontkit);

  // --- First Commit ---
  const page2 = pdfDoc2.addPage([612, 792]);
  const font2 = await pdfDoc2.embedFont(StandardFonts.Helvetica);
  page2.drawText('Page 2 - First Commit', {
    x: 50,
    y: 700,
    size: 24,
    font: font2,
    color: rgb(0.2, 0.2, 0.8),
  });

  await pdfDoc2.saveAndContinue();
  console.log('After commit 1: Pages =', pdfDoc2.getPageCount());

  // --- Second Commit ---
  const page3 = pdfDoc2.addPage([612, 792]);
  page3.drawText('Page 3 - Second Commit', {
    x: 50,
    y: 700,
    size: 24,
    font: font2,
    color: rgb(0.8, 0.2, 0.2),
  });

  // Embed an image
  const catImage = await pdfDoc2.embedJpg(
    assets.images.jpg.cat_riding_unicorn_base64,
  );
  const catDims = catImage.scale(0.25);
  page3.drawImage(catImage, {
    x: 50,
    y: 400,
    width: catDims.width,
    height: catDims.height,
  });

  await pdfDoc2.saveAndContinue();
  console.log('After commit 2: Pages =', pdfDoc2.getPageCount());

  // --- Third Commit ---
  const page4 = pdfDoc2.addPage([612, 792]);

  // Embed a custom font
  const ubuntuFont = await pdfDoc2.embedFont(assets.fonts.ttf.ubuntu_r_base64, {
    subset: true,
  });
  page4.drawText('Page 4 - Third Commit', {
    x: 50,
    y: 700,
    size: 24,
    font: ubuntuFont,
    color: rgb(0.2, 0.6, 0.2),
  });
  page4.drawText('Using Ubuntu Font with custom embedding', {
    x: 50,
    y: 650,
    size: 18,
    font: ubuntuFont,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Reuse the same image - should not duplicate
  page4.drawImage(catImage, {
    x: 50,
    y: 300,
    width: catDims.width / 2,
    height: catDims.height / 2,
  });

  await pdfDoc2.saveAndContinue();
  console.log('After commit 3: Pages =', pdfDoc2.getPageCount());

  // --- Fourth Commit ---
  // Add content to existing page
  const existingPage = pdfDoc2.getPage(0);
  existingPage.drawText('(Modified in 4th commit)', {
    x: 50,
    y: 650,
    size: 14,
    font: ubuntuFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Add a 5th page
  const page5 = pdfDoc2.addPage([612, 792]);
  page5.drawText('Page 5 - Fourth Commit', {
    x: 50,
    y: 700,
    size: 24,
    font: ubuntuFont,
    color: rgb(0.6, 0.2, 0.6),
  });

  const finalBytes = await pdfDoc2.saveAndContinue();
  console.log('After commit 4: Pages =', pdfDoc2.getPageCount());

  console.log('Final document size:', finalBytes.length, 'bytes');

  // Verify the document can be reloaded
  const verifyDoc = await PDFDocument.load(finalBytes);
  console.log('Verified page count after reload:', verifyDoc.getPageCount());

  return finalBytes;
};
