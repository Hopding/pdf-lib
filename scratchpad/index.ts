import fs from 'fs';
import { ParseSpeeds, PDFDocument } from 'src/api';

const main = async () => {
  // const inputBytes = fs.readFileSync('assets/pdfs/bixby_guide.pdf');
  const inputBytes = fs.readFileSync(
    'assets/pdfs/linearized_with_object_streams.pdf',
  );

  console.time('parse');
  const pdfDoc = await PDFDocument.load(inputBytes, {
    parseSpeed: ParseSpeeds.Fastest,
  });
  console.timeEnd('parse');

  const buffer = await pdfDoc.save();
  fs.writeFileSync('./out.pdf', buffer);
  console.log('File written to ./out.pdf');
};

main();
