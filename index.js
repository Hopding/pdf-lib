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
import parseBool from './src/pdfparser/parseBool';
import parseName from './src/pdfparser/parseName';
import parseNull from './src/pdfparser/parseNull';
import parseNumber from './src/pdfparser/parseNumber';
import parseString from './src/pdfparser/parseString';
import parseHexString from './src/pdfparser/parseHexString';
import parseArray from './src/pdfparser/parseArray';
import parseDict from './src/pdfparser/parseDict';
import parseIndirectRef from './src/pdfparser/parseDict';
import parseHeader from './src/pdfparser/parseHeader';
import { arrayIndexOf, arrayToString, trimArray } from './src/utils';

// const bytes = new Uint8Array('fooNBar'.split('').map(c => c.charCodeAt(0)));
// console.log(arrayIndexOf(bytes, 'NB'));
const bytes = fs.readFileSync('/Users/user/Desktop/pdf.binary');
parseDocument(bytes, undefined);

// let str = ''
// bytes.forEach((b) => {
//   str += String.fromCharCode(b);
// });
// console.log(str);
// fs.writeFile('/Users/user/Desktop/1.pdf', bytes);
// fs.writeFile('/Users/user/Desktop/2.pdf', str);

// const input = `
// trailer
// << /Size 276 /Root 197 0 R /Info 1 0 R /ID [ <22ec17e42fd36f29f05813ad31c2d5ad>
// <22ec17e42fd36f29f05813ad31c2d5ad> ] >>
// startxref
// 500303
// %%EOF
// `;
// const bytes = new Uint8Array(input.split('').map(c => c.charCodeAt(0)));
// const [res, rem] = parseTrailer(bytes, undefined);
// console.log('res:', res);
// console.log('rem:', arrayToString(rem));
