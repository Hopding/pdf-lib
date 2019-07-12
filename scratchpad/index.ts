import fs from 'fs';
import { PDFDocument } from 'src/index';
import { openPdf, Reader } from './open';

async function mergePdfs(pdfsToMerge: string[], filePath: string) {
  const mergedPdf = await PDFDocument.create();
  for (const pdfFilePath of pdfsToMerge) {
    const pdfBytes = fs.readFileSync(pdfFilePath);
    const pdf = await PDFDocument.load(pdfBytes);
    const pageIndices = Array.from(pdf.getPages().keys());
    const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
    copiedPages.forEach((page) => {
      mergedPdf.addPage(page);
    });
  }
  const mergedPdfFile = await mergedPdf.save();
  return fs.writeFileSync(filePath, mergedPdfFile);
}

(async () => {
  await mergePdfs(
    [
      '/Users/user/Desktop/facebookiq_millennials_money_january2016.pdf',
      '/Users/user/Desktop/iOS_Security_Guide.pdf',
    ],
    './out.pdf',
  );

  // fs.writeFileSync('./out.pdf', pdfBytes);
  console.log('./out.pdf');

  openPdf('./out.pdf', Reader.Preview);
})();
