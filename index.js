import fs from 'fs';
import PDFParser from './src/pdf-parser';

const inFile = '/Users/user/Desktop/bols/bol7.pdf';
const outFile = '/Users/user/Desktop/modified.pdf';
const bytes = fs.readFileSync(inFile);

const parser = new PDFParser();
const pdfDoc = parser.parse(bytes);

fs.writeFileSync(outFile, pdfDoc.toBytes());
