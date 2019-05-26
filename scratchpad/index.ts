import './create';

// import fs from 'fs';
// import {
//   PDFCatalog,
//   PDFContentStream,
//   PDFName,
//   PDFNumber,
//   PDFOperator,
//   PDFOperatorNames as Ops,
//   PDFPageLeaf,
//   PDFParser,
//   PDFRef,
//   PDFWriter,
//   StandardFontEmbedder,
//   StandardFonts,
// } from 'src/index';

// console.time('Scratchpad');

// const pdfBytes = fs.readFileSync('./assets/pdfs/D-2210_tax_form.pdf');
// // const pdfBytes = fs.readFileSync('./assets/pdfs/F1040V_tax_form.pdf');
// // const pdfBytes = fs.readFileSync('./assets/pdfs/with_comments.pdf');
// // const pdfBytes = fs.readFileSync(
// // './assets/pdfs/pdf20examples/PDF 2.0 with offset start.pdf',
// // );
// // const pdfBytes = fs.readFileSync('./pdf_specification.pdf');
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

// const context = PDFParser.forBytes(pdfBytes).parseDocument();

// /* Add Page */
// const helveticaEmbedder = StandardFontEmbedder.for(StandardFonts.Helvetica);

// const operators = [
//   PDFOperator.of(Ops.BeginText),
//   PDFOperator.of(Ops.SetFontAndSize, [PDFName.of('F1'), PDFNumber.of(24)]),
//   PDFOperator.of(Ops.MoveText, [PDFNumber.of(100), PDFNumber.of(100)]),
//   PDFOperator.of(Ops.ShowText, [
//     helveticaEmbedder.encodeText('Hello World and stuff!'),
//   ]),
//   PDFOperator.of(Ops.EndText),
// ];
// const contentStreamDict = context.obj({});
// const contentStream = PDFContentStream.of(contentStreamDict, operators);
// const contentStreamRef = context.register(contentStream);

// const helveticaFontRef = helveticaEmbedder.embedIntoContext(context);

// const catalog = context.lookup(context.trailerInfo.Root) as PDFCatalog;

// const pageTreeRef = catalog.get(PDFName.of('Pages')) as PDFRef;
// const pageTree = catalog.Pages();

// const pageLeaf = PDFPageLeaf.withContextAndParent(context, pageTreeRef);
// pageLeaf.set(PDFName.of('Contents'), contentStreamRef);
// pageLeaf.set(
//   PDFName.of('Resources'),
//   context.obj({ Font: { F1: helveticaFontRef } }),
// );
// const pageRef = context.register(pageLeaf);

// pageTree.pushLeafNode(pageRef);

// /************/

// const buffer = PDFWriter.serializeContextToBuffer(context);
// console.timeEnd('Scratchpad');

// fs.writeFileSync('./out.pdf', buffer);
// console.log('File written to ./out.pdf');
