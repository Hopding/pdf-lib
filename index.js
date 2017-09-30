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

import fs from 'fs';

const parseHandlers = {
  onParseHeader: (header) => {
    console.log('Header Parsed: ', header);
  },
  onParseXRefTable: (xRefTable) => {
    console.log('XRefTable Parsed: ', xRefTable);
  },
  onParseTrailer: (trailer) => {
    console.log('Trailer Parsed: ', trailer);
  },
  onParseBool: (bool) => {
    console.log('Bool Parsed: ', bool);
  },
  onParseArray: (array) => {
    console.log('Array Parsed: ', array);
  },
  onParseDict: (dict) => {
    console.log('Dict Parsed: ', dict);
  },
  onParseHexString: (hexStr) => {
    console.log('Hex String Parsed: ', hexStr);
  },
  onParseIndirectObj: (indirectObj) => {
    console.log('Indirect Object Parsed: ', indirectObj);
  },
  onParseIndirectRef: (indirectRef) => {
    console.log('Indirect Ref Parsed: ', indirectRef);
  },
  onParseName: (name) => {
    console.log('Name Parsed: ', name);
  },
  onParseNull: (nl) => {
    console.log('Null Parsed: ', nl);
  },
  onParseNumber: (nmbr) => {
    console.log('Number Parsed: ', nmbr);
  },
  onParseStream: (strm) => {
    console.log('Stream Parsed: ', strm);
  },
  onParseString: (str) => {
    console.log('String Parsed: ', str);
  },
}

const pdf = PDFDocument();
pdf.newPage()
  .text(100, 100, 'F1', 24, 'Hello World!')
  .text(250, 250, 'F1', 24, 'Some more text!');
pdf.newPage().text(250, 250, 'F1', 50, 'This is page 2!')

// parseDocument(pdf.toString(), parseHandlers);
// console.log(parseDocument(pdf.toString(), undefined));
fs.readFile('/Users/user/Desktop/bol.pdf', 'utf8', (err, data) => {
  if (err) throw err;
  // console.log(parseDocument(data))
  parseDocument(data, parseHandlers)
})
