import fs from 'fs';
import { PDFArray, PDFName, PDFParser, PDFRawStream } from 'src/index';

// // console.time('Scratchpad');

// // const context = PDFContext.create();

// // const contentStream = context.stream(`
// //   BT
// //     /F1 24 Tf
// //     100 100 Td
// //     (Hello World and stuff!) Tj
// //   ET
// // `);
// // const contentStreamRef = context.register(contentStream);

// // const fontDict = context.obj({
// //   Type: 'Font',
// //   Subtype: 'Type1',
// //   Name: 'F1',
// //   BaseFont: 'Helvetica',
// //   Encoding: 'MacRomanEncoding',
// // });
// // const fontDictRef = context.register(fontDict);

// // const page = context.obj({
// //   Type: 'Page',
// //   MediaBox: [0, 0, 612, 792],
// //   Contents: contentStreamRef,
// //   Resources: { Font: { F1: fontDictRef } },
// // });
// // const pageRef = context.register(page);

// // const pages = context.obj({
// //   Type: 'Pages',
// //   Kids: [pageRef],
// //   Count: 1,
// // });
// // const pagesRef = context.register(pages);
// // page.set(PDFName.of('Parent'), pagesRef);

// // const catalog = context.obj({
// //   Type: 'Catalog',
// //   Pages: pagesRef,
// // });
// // context.catalogRef = context.register(catalog);

// const pdfBytes = fs.readFileSync('./assets/pdfs/D-2210_tax_form.pdf');
// const pdfBytes = fs.readFileSync('./assets/pdfs/F1040V_tax_form.pdf');
// const pdfBytes = fs.readFileSync('./assets/pdfs/with_comments.pdf');
// const pdfBytes = fs.readFileSync(
// './assets/pdfs/pdf20examples/PDF 2.0 with offset start.pdf',
// );
// const pdfBytes = fs.readFileSync('./pdf_specification.pdf');
// const pdfBytes = fs.readFileSync('./out.pdf');

// const pdfBytes = fs.readFileSync('/Users/user/Desktop/listing_protected.pdf');

// console.time('Scratchpad');
const files = String(fs.readFileSync('/Users/user/Desktop/PDF_FILES_TEMP.txt'))
  .split('\n')
  .filter(Boolean);
let idx = 0;
const filters = new Set();
files.forEach((file) => {
  try {
    console.log('Checking', file);
    const pdfBytes = fs.readFileSync(file);
    const context = PDFParser.forBytes(pdfBytes).parseDocument();
    context.enumerateIndirectObjects().forEach(([_key, value]) => {
      if (!(value instanceof PDFRawStream)) return;
      const Filter = context.lookup(value.dict.get(PDFName.of('Filter'))!);
      if (!Filter) return;
      if (Filter instanceof PDFName) {
        filters.add(Filter);
        fs.writeFileSync(
          `./tmpstreams/${idx++}_${Filter.toString().substring(1)}`,
          value.contents,
        );
      } else if (Filter instanceof PDFArray) {
        if (Filter.size() === 1) {
          filters.add(Filter.get(0));
          fs.writeFileSync(
            `./tmpstreams/${idx++}_${Filter.get(0)
              .toString()
              .substring(1)}`,
            value.contents,
          );
        } else {
          console.log('SKIPPING:', Filter.toString());
        }
        // for (let idx = 0, len = Filter.size(); idx < len; idx++) {
        // filters.add(Filter.get(idx));
        // }
      } else {
        throw new Error(`WTF: ${Filter!.constructor.name}`);
      }
    });
  } catch (e) {
    console.error(e);
  }
});
console.log('Filters:', filters);

// context.catalogRef = context.trailer!.get(PDFName.of('Root')) as PDFRef;
// const buffer = PDFWriter.serializeContextToBuffer(context);
// console.timeEnd('Scratchpad');

// fs.writeFileSync('./out.pdf', buffer);
// console.log('File written to ./out.pdf');

// import fs from 'fs';
// import pako from 'pako';
// // import { FlateStream, Stream } from 'src/core/streams';

// const raw = fs.readFileSync('./flate_streams/1.stream');
// const stream = new Stream(raw, 0, raw.length);
// const flateStream = new FlateStream(stream) as any;

// console.log('FLATE STREAM:');
// console.log(flateStream);

// console.log();
// console.log(Object.getOwnPropertyNames(flateStream));

// const array = [];

// while (flateStream.peekByte() !== -1) {
//   // while (!flateStream.eof) {
//   array.push(flateStream.getByte());
// }

// const buffer = new Uint8Array(array);
// fs.writeFileSync('./decoded.stream', buffer);

// fs.writeFileSync('./decoded.stream', pako.inflate(raw));

// const block = flateStream.readBlock();
// const byte = block.

// getByte
// console.log('BLOCK');
// console.log(block);
