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

const pdf = PDFDocument();
pdf.newPage()
  .text(100, 100, 'F1', 24, 'Hello World!')
  .text(250, 250, 'F1', 24, 'Some more text!');
pdf.newPage().text(250, 250, 'F1', 50, 'This is page 2!')

console.log(pdf.toString());
