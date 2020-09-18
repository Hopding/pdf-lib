import fs from 'fs';
import { openPdf, Reader } from './open';
import { PDFDocument } from 'src/index';

(async () => {
  const pdfDoc = await PDFDocument.load(
    fs.readFileSync('/Users/user/Desktop/bugged-document.pdf'),
  );

  const pages = pdfDoc.getPages();

  pages.forEach((page) => {
    page.node.Parent()?.ascend((x) => {
      console.log(x.toString());
    });
  });

  const pdfBytes = await pdfDoc.save();

  fs.writeFileSync('out.pdf', pdfBytes);
  openPdf('out.pdf', Reader.Preview);
})();
