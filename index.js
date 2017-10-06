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

// fs.readFile('/Users/user/Desktop/bol.pdf', 'utf8', (err, data) => {
//   if (err) throw err;
//   const updatedDoc = parser(data);
//   updatedDoc.getPage(0)
//     .text(300, 300, 'F1', 24, 'This page has been modified!');
//   const stringView = new StringView(updatedDoc.toString(), 'UTF-16');
//   fs.writeFile('/Users/user/Desktop/updated-pdf.pdf', stringView.rawData);
// })

// fs.readFile('/Users/user/Desktop/test.binary', 'utf8', (err, data) => {
//   if (err) throw err;
//   console.log(data);
//   fs.writeFile('/Users/user/Desktop/test.foo', data);
// })

import removeComments from './src/pdfparser/removeComments';
import parseIndirectObj from './src/pdfparser/parseIndirectObj';
import parseXRefTable from './src/pdfparser/parseXRefTable';
import parseTrailer from './src/pdfparser/parseTrailer';
import { arrayIndexOf } from './src/utils';

const bytes = fs.readFileSync('/Users/user/Desktop/pdf.binary');
// const sv = new StringView(removeComments(bytes));
// console.log('removeComments_result:', sv.toString())
parseDocument(bytes, undefined);

// let str = ''
// bytes.forEach((b) => {
//   str += String.fromCharCode(b);
// });
// console.log(str);
// fs.writeFile('/Users/user/Desktop/1.pdf', bytes);
// fs.writeFile('/Users/user/Desktop/2.pdf', str);

// const input = `
// %PDF-1.3
// %�����������
// trailer
// << /Size 276 /Root 197 0 R /Info 1 0 R /ID [ <22ec17e42fd36f29f05813ad31c2d5ad>
// <22ec17e42fd36f29f05813ad31c2d5ad> ] >>
// startxref
// 500303
// %%EOF
// `;
// const bytes = new Uint8Array(input.split('').map(c => c.charCodeAt(0)));
// const res = removeComments(bytes, 0, undefined);
// console.log('output:', (new StringView(res)).toString());
