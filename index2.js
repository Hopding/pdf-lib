/* eslint-disable no-unused-vars, no-restricted-syntax */
import fs from 'fs';
import file from 'file';
import { PDFIndirectReference } from './src/core/pdf-objects';
import { PDFPage } from './src/core/pdf-structures';
import PDFObjectIndex from './src/core/pdf-document/PDFObjectIndex';
import PDFDocumentFactory from './src/core/pdf-document/PDFDocumentFactory';
// import { arrayToString } from './src/utils';

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

const inFile = files.BOL(1);
const outFile = '/Users/user/Desktop/modified.pdf';
const bytes = fs.readFileSync(inFile);

// const index = PDFObjectIndex.for(bytes);
// console.log(index.lookup(PDFIndirectReference.forNumbers(50, 0)).toString());

const pdfDoc = PDFDocumentFactory.update(bytes);
pdfDoc.addPage(PDFPage.create([500, 500]));

// const testPdfsDir = `${__dirname}/test-pdfs/pdf`;
// const testPdfsDir = `/Users/user/Documents/Forms PDFs`;
// const TARGET_HEADER_LENGTH = 8;
// const TARGET_HEADERS = ['%PDF-1.1', '%PDF-1.2', '%PDF-1.3', '%PDF-1.4'];
//
// const findTargetPDFs = () => {
//   const allPdfs = [];
//   file.walkSync(testPdfsDir, (dirPath, dirs, files) => {
//     files.forEach(fileName => allPdfs.push(`${dirPath}/${fileName}`));
//   });
//   for (const pdf of allPdfs) {
//     const bytes = fs.readFileSync(pdf);
//     if (
//       TARGET_HEADERS.includes(arrayToString(bytes, 0, TARGET_HEADER_LENGTH))
//     ) {
//       console.log(pdf);
//     }
//   }
// };
//
// findTargetPDFs();
