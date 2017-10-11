import fs from 'fs';
import PDFParser from './src/pdf-parser';
import { PDFDictionary, PDFName } from './src/pdf-objects';
import { PDFContentStream } from './src/pdf-structures';

const inFile = '/Users/user/Desktop/bols/bol.pdf';
const outFile = '/Users/user/Desktop/modified.pdf';
const bytes = fs.readFileSync(inFile);

const parser = new PDFParser();
const pdfDoc = parser.parse(bytes);

const pages = pdfDoc.getPages();
console.log(pages.length);
const page1 = pages[0];
console.log(page1.getContentStreams().length);
page1
  .get('Resources')
  .pdfObject.get('Font')
  .set(
    'F1',
    PDFDictionary.fromObject({
      Type: PDFName.forString('Font'),
      Subtype: PDFName.forString('Type1'),
      BaseFont: PDFName.forString('Times-Roman'),
    }),
  );

const stream = new PDFContentStream()
  .beginText()
  .setFont('F1', 50)
  .moveText(250, 250)
  .showText('TESTING TESTING TESTING')
  .endText();
page1.addContentStream(stream);
console.log(page1.getContentStreams().length);

fs.writeFileSync(outFile, pdfDoc.toBytes());
