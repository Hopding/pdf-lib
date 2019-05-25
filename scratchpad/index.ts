import fs from 'fs';
import { PDFParser, PDFWriter } from 'src/index';

console.time('Scratchpad');

// const context = PDFContext.create();

// const contentStream = context.stream(`
//   BT
//     /F1 24 Tf
//     100 100 Td
//     (Hello World and stuff!) Tj
//   ET
// `);
// const contentStreamRef = context.register(contentStream);

// const fontDict = context.obj({
//   Type: 'Font',
//   Subtype: 'Type1',
//   Name: 'F1',
//   BaseFont: 'Helvetica',
//   Encoding: 'MacRomanEncoding',
// });
// const fontDictRef = context.register(fontDict);

// const page = context.obj({
//   Type: 'Page',
//   MediaBox: [0, 0, 612, 792],
//   Contents: contentStreamRef,
//   Resources: { Font: { F1: fontDictRef } },
// });
// const pageRef = context.register(page);

// const pages = context.obj({
//   Type: 'Pages',
//   Kids: [pageRef],
//   Count: 1,
// });
// const pagesRef = context.register(pages);
// page.set(PDFName.of('Parent'), pagesRef);

// const catalog = context.obj({
//   Type: 'Catalog',
//   Pages: pagesRef,
// });
// context.catalogRef = context.register(catalog);

const pdfBytes = fs.readFileSync('./assets/pdfs/D-2210_tax_form.pdf');
// const pdfBytes = fs.readFileSync('./assets/pdfs/F1040V_tax_form.pdf');
// const pdfBytes = fs.readFileSync('./assets/pdfs/with_comments.pdf');
// const pdfBytes = fs.readFileSync(
// './assets/pdfs/pdf20examples/PDF 2.0 with offset start.pdf',
// );
// const pdfBytes = fs.readFileSync('./pdf_specification.pdf');
// const pdfBytes = fs.readFileSync('./out.pdf');

// const PATHS = String(fs.readFileSync('/Users/TEMP/Desktop/PDF_FILES_TEMP.txt'))
//   .split('\n')
//   .filter(Boolean);

// PATHS.forEach((path) => {
//   console.log('Checking:', path);
//   const pdfBytes = new Uint8Array(fs.readFileSync(path));
//   PDFParser.forBytes(pdfBytes).parseDocument();
// });

const context = PDFParser.forBytes(pdfBytes).parseDocument();

const buffer = PDFWriter.serializeContextToBuffer(context);
console.timeEnd('Scratchpad');

fs.writeFileSync('./out.pdf', buffer);
console.log('File written to ./out.pdf');
