import './create';

// import fs from 'fs';
// import { PDFDocument } from 'src/index';

// console.time('Scratchpad');

// // const pdfBytes2 = fs.readFileSync('./assets/pdfs/D-2210_tax_form.pdf');
// // const pdfBytes1 = fs.readFileSync('./assets/pdfs/F1040V_tax_form.pdf');
// // const pdfBytes1 = fs.readFileSync('./assets/pdfs/giraffe.pdf');
// // const pdfBytes1 = fs.readFileSync('./assets/pdfs/with_comments.pdf');
// // const pdfBytes1 = fs.readFileSync(
// // './assets/pdfs/pdf20examples/PDF 2.0 with offset start.pdf',
// // );
// // const pdfBytes1 = fs.readFileSync('./pdf_specification.pdf');
// // const pdfBytes1 = fs.readFileSync('/Users/user/Desktop/20180508_00024.pdf');
// // const pdfBytes1 = fs.readFileSync(
// // '/Users/user/Desktop/Din_Microsoft-fakturaoversikt.pdf',
// // );
// const pdfBytes1 = fs.readFileSync(
//   '/Users/user/github/pdf-lib-old/pdf_specification.pdf',
// );
// // const pdfBytes = fs.readFileSync('./out.pdf');

// // const PATHS = String(fs.readFileSync('/Users/user/Desktop/PDF_FILES_TEMP.txt'))
// //   .split('\n')
// //   .filter(Boolean);

// // PATHS.forEach((path) => {
// //   try {
// //     console.log('Checking:', path);
// //     const pdfBytes = new Uint8Array(fs.readFileSync(path));
// //     PDFParser.forBytes(pdfBytes).parseDocument();
// //   } catch (e) {
// //     console.log('ERROR');
// //   }
// // });

// const main = async () => {
//   // const pdfDoc = PDFDocument.load(pdfBytes1);

//   // const pages = pdfDoc.getPages();

//   // const firstPage = pages[122 - 1];

//   // firstPage.setFontSize(24);
//   // firstPage.moveTo(100, 100);
//   // firstPage.drawText('Hello World and stuff!');

//   // const page = pdfDoc.insertPage(1 - 1);

//   // page.setFontSize(24);
//   // page.moveTo(100, 100);
//   // page.drawText('Hello World and stuff!');

//   // const donorPdfDoc = PDFDocument.load(pdfBytes2);
//   // const donorPage = donorPdfDoc.getPages()[0];
//   // pdfDoc.insertPage(pages.length, donorPage);

//   // // pdfDoc.insertPage(1);
//   // pdfDoc.removePage(123 - 1);

//   const pdfDoc = PDFDocument.load(pdfBytes1);

//   pdfDoc.insertPage(1 - 1);
//   pdfDoc.removePage(122 - 1);

//   // pdfDoc.removePage(3 - 1);

//   const buffer = await pdfDoc.save();
//   console.timeEnd('Scratchpad');

//   fs.writeFileSync('./out.pdf', buffer);
//   console.log('File written to ./out.pdf');
// };

// main();
