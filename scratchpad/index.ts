import fs from 'fs';
import { PDFDocument } from 'src/api';

const main = async () => {
  const inputBytes = fs.readFileSync('assets/pdfs/bixby_guide.pdf');

  PDFDocument.load(inputBytes);

  // const buffer = await pdfDoc.save();
  // fs.writeFileSync('./out.pdf', buffer);
  // console.log('File written to ./out.pdf');
};

main();
