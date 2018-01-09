/* eslint-disable no-unused-vars */
import fs from 'fs';
import PDFDocumentFactory from './src/core/pdf-document/PDFDocumentFactory';
import PDFDocumentWriter from './src/core/pdf-document/PDFDocumentWriter';
import { PDFDictionary, PDFName } from './src/core/pdf-objects';
import { PDFContentStream, PDFPage } from './src/core/pdf-structures';
import PDFXRefTableFactory from './src/core/pdf-structures/factories/PDFXRefTableFactory';
import PDFOperators from './src/core/pdf-operators';

import { arrayToString, charCodes, writeToDebugFile } from './src/utils';

/*
Adding "TESTING" to "/Users/user/Desktop/pdf-lib/test-pdfs/pdf/ef/inst/ef_ins_1040.pdf"
messes up the text within the "Caution" sections...
*/

const files = {
  BOL: n => `/Users/user/Desktop/bols/bol${n || ''}.pdf`,
  MINIMAL: '/Users/user/Desktop/pdf-lib/test-pdfs/minimal.pdf',
  PDF_SPEC: '/Users/user/Documents/PDF32000_2008.pdf',
  CMP_SIMPLE_TABLE_DECOMPRESS:
    '/Users/user/Documents/cmp_simple_table-decompress.pdf',
  CMP_SIMPLE_TABLE: '/Users/user/Documents/cmp_simple_table.pdf',
  AST_SCI_DATA_TABLES: '/Users/user/Documents/ast_sci_data_tables_sample.pdf',
  MOVE_CRM_WEB_SERV: '/Users/user/Documents/moveCRM_Webservices.pdf',
  ANOTHER_LINEARIZED:
    '/Users/user/Desktop/pdf-lib/test-pdfs/pdf/dc/inst/dc_ins_2210.pdf',
  UPDATED: '/Users/user/Desktop/pdf-lib/test-pdfs/pdf/fd/form/F1040V.pdf',
};

const inFile = files.BOL(6);
const outFile = '/Users/user/Desktop/modified.pdf';
const bytes = fs.readFileSync(inFile);

console.time('PDFDocument');
const pdfDoc = PDFDocumentFactory.load(bytes);

const pages = pdfDoc.getPages();
console.log(`Pages: ${pages.length}`);
// const page1 = pages[0];
// console.log(`Page 1 Content Streams: ${page1.contentStreams.length}`);

const createDrawing = () => {
  const { J, j, m, l, S, w, d, re, g, c, b, B, RG, rg, ri, i } = PDFOperators;
  const contentStream = PDFContentStream.of(
    i.of(100),
    ri.of('AbsoluteColorimetric'),
    // Draw black line segment
    m.of(50, 50),
    l.of(500, 500),
    S.operator,
    // Draw a thicker, dashed line segment
    w.of(4),
    d.of([4, 6], 0),
    m.of(150, 250),
    l.of(400, 250),
    S.operator,
    d.of([], 0),
    w.of(1),
    // Draw a rectangle with a 1-unit red border, filled with light blue.
    RG.of(1.0, 0.0, 0.0),
    rg.of(0.5, 0.75, 1.0),
    re.of(200, 300, 50, 75),
    B.operator,
  );
  // Draw a curve filled with gray and with a colored border.
  contentStream.operators.push(
    RG.of(0.5, 0.1, 0.2),
    g.of(0.7),
    m.of(300, 300),
    c.of(300, 400, 400, 400, 400, 300),
    b.operator,
  );
  return pdfDoc.register(contentStream);
};

const contentStream = createDrawing();
pages.forEach(page => page.addContentStream(pdfDoc.lookup, contentStream));

const newPage = PDFPage.create([500, 500]).addContentStream(
  pdfDoc.lookup,
  contentStream,
);
const newPage2 = PDFPage.create([400, 400]).addContentStream(
  pdfDoc.lookup,
  contentStream,
);

pdfDoc.addPage(newPage);
pdfDoc.insertPage(1, newPage2);
pdfDoc.removePage(0);

console.time('saveToBytes');
const savedBytes = PDFDocumentWriter.saveToBytes(pdfDoc);
console.timeEnd('saveToBytes');
console.timeEnd('PDFDocument');
fs.writeFileSync(outFile, savedBytes);
