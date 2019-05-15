import fs from 'fs';
import {
  CharCodes,
  PDFContext,
  PDFCrossRefSection,
  PDFHeader,
  PDFName,
  PDFObject,
  PDFRef,
  PDFTrailer,
  PDFTrailerDict,
  // PDFWriter,
} from 'src/index';

console.time('Scratchpad');

const context = PDFContext.create();

const header = PDFHeader.forVersion(1, 7);

const contentStream = context.stream(`
  BT
    /F1 24 Tf
    100 100 Td 
    (Hello World and stuff) Tj
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

const page = context.obj({
  Type: 'Page',
  // Parent: pagesRef,
  MediaBox: [0, 0, 612, 792],
  Contents: contentStreamRef,
  Resources: { Font: { F1: fontDictRef } },
});
const pageRef = context.register(page);

const pages = context.obj({
  Type: 'Pages',
  Kids: [pageRef],
  Count: 1,
});
const pagesRef = context.register(pages);
page.set(PDFName.of('Parent'), pagesRef);

const catalog = context.obj({
  Type: 'Catalog',
  Pages: pagesRef,
});
const catalogRef = context.register(catalog);

let offset = header.sizeInBytes() + 1;

const byAscendingObjectNumber = (
  [a]: [PDFRef, PDFObject],
  [b]: [PDFRef, PDFObject],
) => a.objectNumber - b.objectNumber;

const indirectObjects = context
  .enumerateIndirectObjects()
  .sort(byAscendingObjectNumber);

const xref = PDFCrossRefSection.create();
for (let idx = 0, len = indirectObjects.length; idx < len; idx++) {
  const [ref, object] = indirectObjects[idx];
  xref.addEntry(ref, offset);
  offset += ref.sizeInBytes() + 2 + 1 + object.sizeInBytes() + 1 + 6 + 1;
}

const xRefOffset = offset;
offset += xref.sizeInBytes();

const trailerDict = PDFTrailerDict.of(
  context.obj({
    Size: context.largestObjectNumber + 1,
    Root: catalogRef,
  }),
);
offset += trailerDict.sizeInBytes() + 1;

const trailer = PDFTrailer.forLastCrossRefSectionOffset(xRefOffset);
offset += trailer.sizeInBytes();

/////

const buffer = new Uint8Array(offset);

let buffOffset = 0;

buffOffset += header.copyBytesInto(buffer, buffOffset);
buffer[buffOffset++] = CharCodes.Newline;

for (let ioIdx = 0, ioLen = indirectObjects.length; ioIdx < ioLen; ioIdx++) {
  const [ref, object] = indirectObjects[ioIdx];

  const objNum = String(ref.objectNumber);
  for (let idx = 0, len = objNum.length; idx < len; idx++) {
    buffer[buffOffset++] = objNum.charCodeAt(idx);
  }
  buffer[buffOffset++] = CharCodes.Space;

  const genNum = String(ref.generationNumber);
  for (let idx = 0, len = genNum.length; idx < len; idx++) {
    buffer[buffOffset++] = genNum.charCodeAt(idx);
  }
  buffer[buffOffset++] = CharCodes.Space;

  buffer[buffOffset++] = CharCodes.o;
  buffer[buffOffset++] = CharCodes.b;
  buffer[buffOffset++] = CharCodes.j;
  buffer[buffOffset++] = CharCodes.Newline;

  buffOffset += object.copyBytesInto(buffer, buffOffset);

  buffer[buffOffset++] = CharCodes.Newline;
  buffer[buffOffset++] = CharCodes.e;
  buffer[buffOffset++] = CharCodes.n;
  buffer[buffOffset++] = CharCodes.d;
  buffer[buffOffset++] = CharCodes.o;
  buffer[buffOffset++] = CharCodes.b;
  buffer[buffOffset++] = CharCodes.j;
  buffer[buffOffset++] = CharCodes.Newline;
}

buffOffset += xref.copyBytesInto(buffer, buffOffset);
buffOffset += trailerDict.copyBytesInto(buffer, buffOffset);
buffer[buffOffset++] = CharCodes.Newline;
buffOffset += trailer.copyBytesInto(buffer, buffOffset);

console.timeEnd('Scratchpad');

fs.writeFileSync('./out.pdf', buffer);
console.log('File written to ./out.pdf');
