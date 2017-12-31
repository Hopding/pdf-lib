import fs from 'fs';
import { arrayToString, charCodes, writeToDebugFile } from './src/utils';
import PDFParser from './src/pdf-parser';
import parseDict from './src/pdf-parser/parseDict';
import { PDFDictionary, PDFName } from './src/pdf-objects';
import { PDFContentStream } from './src/pdf-structures';

const files = {
  BOL: n => `/Users/user/Desktop/bols/bol${n || ''}.pdf`,
  MINIMAL: '/Users/user/Desktop/pdf-lib/test-pdfs/minimal.pdf',
};
const inFile = files.BOL(7);
const outFile = '/Users/user/Desktop/modified.pdf';
const bytes = fs.readFileSync(inFile);

const parser = new PDFParser();
const pdfDoc = parser.parse(bytes);

const pages = pdfDoc.getPages();
console.log(`Pages: ${pages.length}`);
const page1 = pages[0];
console.log(`Content Streams: ${page1.getContentStreams().length}`);

const editPdf = () => {
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
    .moveText(0, 50)
    .showText('TESTING TESTING TESTING')
    .endText();
  page1.addContentStream(stream);
};

editPdf();
// console.log(page1.getContentStreams().length);

fs.writeFileSync(outFile, pdfDoc.toBytes());
