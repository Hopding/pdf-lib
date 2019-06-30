import fs from 'fs';
import { PDFDocument } from 'src/api';

const main = async () => {
  const inputBytes = fs.readFileSync('assets/pdfs/with_invalid_stream_EOL.pdf');
  const pdfDoc = PDFDocument.load(inputBytes);
  console.log('ENCRYPTED:', pdfDoc.isEncrypted);
  console.log('PAGES:', pdfDoc.getPages().length);
  const buffer = await pdfDoc.save();
  fs.writeFileSync('./out.pdf', buffer);
  console.log('File written to ./out.pdf');
};

main();
