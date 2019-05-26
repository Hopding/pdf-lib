// import './create';

import fs from 'fs';
import {
  PDFCatalog,
  PDFName,
  PDFPageLeaf,
  PDFParser,
  PDFRef,
  PDFWriter,
} from 'src/index';

console.time('Scratchpad');

const pdfBytes = fs.readFileSync('./assets/pdfs/D-2210_tax_form.pdf');
// const pdfBytes = fs.readFileSync('./assets/pdfs/F1040V_tax_form.pdf');
// const pdfBytes = fs.readFileSync('./assets/pdfs/with_comments.pdf');
// const pdfBytes = fs.readFileSync(
// './assets/pdfs/pdf20examples/PDF 2.0 with offset start.pdf',
// );
// const pdfBytes = fs.readFileSync('./pdf_specification.pdf');
// const pdfBytes = fs.readFileSync('./out.pdf');

// const PATHS = String(fs.readFileSync('/Users/user/Desktop/PDF_FILES_TEMP.txt'))
//   .split('\n')
//   .filter(Boolean);

// PATHS.forEach((path) => {
//   try {
//     console.log('Checking:', path);
//     const pdfBytes = new Uint8Array(fs.readFileSync(path));
//     PDFParser.forBytes(pdfBytes).parseDocument();
//   } catch (e) {
//     console.log('ERROR');
//   }
// });

const context = PDFParser.forBytes(pdfBytes).parseDocument();

/* Add Page */

const contentStream = context.stream(`
  BT
    /F1 24 Tf
    100 100 Td
    (Hello World and stuff!) Tj
  ET
`);
const contentStreamRef = context.register(contentStream);

const fontDict = context.obj({
  Type: 'Font',
  Subtype: 'Type1',
  Name: 'F1',
  BaseFont: 'Helvetica',
  Encoding: 'MacRomanEncoding',
});
const fontDictRef = context.register(fontDict);

const catalog = context.lookup(context.trailerInfo.Root) as PDFCatalog;

const pageTreeRef = catalog.get(PDFName.of('Pages')) as PDFRef;
const pageTree = catalog.Pages();

const pageLeaf = PDFPageLeaf.withContextAndParent(context, pageTreeRef);
pageLeaf.set(PDFName.of('Contents'), contentStreamRef);
pageLeaf.set(
  PDFName.of('Resources'),
  context.obj({ Font: { F1: fontDictRef } }),
);
const pageRef = context.register(pageLeaf);

pageTree.pushLeafNode(pageRef);

/************/

const buffer = PDFWriter.serializeContextToBuffer(context);
console.timeEnd('Scratchpad');

fs.writeFileSync('./out.pdf', buffer);
console.log('File written to ./out.pdf');
