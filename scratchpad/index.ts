import fs from 'fs';
import { openPdf, Reader } from './open';

import { PDFDocument, PDFName, PDFString, PDFHexString } from 'src/index';

const strings = {
  original: 'Egg 🍳',
  hexOriginal: 'FEFF0045006700670020D83CDF73',
  literalOriginal:
    '\\376\\377\\000\\105\\000\\147\\000\\147\\000\\040\\330\\074\\337\\163',
  literalAscii: '\\376\\377\0E\0g\0g\0 \\330<\\337s',
  literalIrregular: '\\376\\377\0E\\\n\\0g\0g\0 \\330<\\337s',
};

(() => [PDFString, PDFHexString])();

(async () => {
  const pdfDoc = await PDFDocument.create();

  const key = PDFName.of('Title');
  // (pdfDoc as any).getInfoDict().set(key, PDFHexString.of(strings.hexOriginal));
  // (pdfDoc as any).getInfoDict().set(key, PDFString.of(strings.literalOriginal));
  (pdfDoc as any).getInfoDict().set(key, PDFString.of('a\nb\rc\\xd\\;'));

  console.log(
    'hexOriginal:',
    PDFHexString.of(strings.hexOriginal).decodeText(),
  );
  console.log('literalAscii:', PDFString.of(strings.literalAscii).decodeText());
  console.log(
    'literalOriginal:',
    PDFString.of(strings.literalOriginal).decodeText(),
  );
  console.log(
    'literalIrregular:',
    PDFString.of(strings.literalIrregular).decodeText(),
  );

  const pdfBytes = await pdfDoc.save();

  fs.writeFileSync('./out.pdf', pdfBytes);

  openPdf('./out.pdf', Reader.Acrobat);
})();

/******************************/

// import { toHexStringOfMinLength, utf16Encode } from 'src/index';

// const toOctalStringOfMinLength = (num: number, minLength: number) =>
//   num.toString(8).padStart(minLength, '0');

// const utf16EncodeAsBytes = (input: string, byteOrderMark = true) => {
//   const utf16 = utf16Encode(input, byteOrderMark);
//   const bytes = new Uint8Array(utf16.length * 2);

//   let offset = 0;
//   for (let idx = 0, len = utf16.length; idx < len; idx++) {
//     bytes[offset++] = (utf16[idx] & 0xff00) >> 8;
//     bytes[offset++] = (utf16[idx] & 0x00ff) >> 0;
//   }

//   return bytes;
// };

// const printHexString = (input: string) => {
//   const words = utf16Encode(input);
//   const hex = Array.from(words).map((word) => toHexStringOfMinLength(word, 4));
//   const hexString = '<' + hex.join('') + '>';
//   console.log(hexString);
// };

// const printLiteralString = (input: string) => {
//   const bytes = utf16EncodeAsBytes(input);
//   const octal = Array.from(bytes).map((byte) =>
//     toOctalStringOfMinLength(byte, 3),
//   );
//   const literalString = '(' + octal.map((byte) => `\\${byte}`).join('') + ')';
//   console.log(literalString);
// };

// console.log('Egg 🍳');
// printHexString('Egg 🍳');
// printLiteralString('Egg 🍳');
