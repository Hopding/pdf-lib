import parseDocument from './src/pdfparser/parseDocument';
import {
  PDFArrayObject,
  PDFDictionaryObject,
  PDFNameObject,
  PDFIndirectObject,
  PDFStreamObject,
  PDFTextObject,
  PDFCrossRefTable,
  PDFTrailer,
} from './src/PDFObjects';
import PDFDocument from './src/PDFDocument';
import UpdatedPDFDocument from './src/UpdatedPDFDocument';
import parser from './src/pdfparser';
import StringView from './src/StringView';

import fs from 'fs';

// const pdf = PDFDocument();
// pdf.newPage()
//   .text(100, 100, 'F1', 24, 'Hello World!')
//   .text(250, 250, 'F1', 24, 'Some more text!');
// pdf.newPage().text(250, 250, 'F1', 50, 'This is page 2!')

// console.log(pdf.toString())
// parseDocument(pdf.toString(), parseHandlers);

// const updatedDoc = parser(pdf.toString());
// updatedDoc.getPage(0)
//   .text(300, 300, 'F1', 24, 'This page has been modified!');
// fs.writeFile('/Users/user/Desktop/updated-pdf.pdf', updatedDoc.toString());

fs.readFile('/Users/user/Desktop/bol.pdf', 'utf8', (err, data) => {
  if (err) throw err;
  const updatedDoc = parser(data);
  updatedDoc.getPage(0)
    .text(300, 300, 'F1', 24, 'This page has been modified!');
  const stringView = new StringView(updatedDoc.toString(), 'UTF-16');
  fs.writeFile('/Users/user/Desktop/updated-pdf.pdf', stringView.rawData);
})

// fs.readFile('/Users/user/Desktop/test.binary', 'utf8', (err, data) => {
//   if (err) throw err;
//   console.log(data);
//   fs.writeFile('/Users/user/Desktop/test.foo', data);
// })
