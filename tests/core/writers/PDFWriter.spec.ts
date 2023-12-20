import pako from 'pako';
import {
  mergeIntoTypedArray,
  PDFContext,
  PDFName,
  PDFRef,
  PDFWriter,
  typedArrayFor,
} from '../../../src/index';

const contentStreamText = `
  BT
    /F1 24 Tf
    100 100 Td
    (Hello World and stuff!) Tj
  ET
`;

const encodedContentStream = pako.deflate(typedArrayFor(contentStreamText));

const pdfBytes = mergeIntoTypedArray(
  `%PDF-1.7
%

9000 0 obj
<<
/Filter /FlateDecode
/Length 67
>>
stream
`,
  encodedContentStream,
  `
endstream
endobj

9001 0 obj
<<
/Type /Font
/Subtype /Type1
/Name /F1
/BaseFont /Helvetica
/Encoding /MacRomanEncoding
>>
endobj

9002 0 obj
<<
/Type /Page
/MediaBox [ 0 0 612 792 ]
/Contents 9000 0 R
/Resources <<
/Font <<
/F1 9001 0 R
>>
>>
/Parent 9003 0 R
>>
endobj

9003 0 obj
<<
/Type /Pages
/Kids [ 9002 0 R ]
/Count 1
>>
endobj

9004 0 obj
<<
/Type /Catalog
/Pages 9003 0 R
>>
endobj

xref
0 1
0000000000 65535 f 
9000 5
0000000016 00000 n 
0000000158 00000 n 
0000000270 00000 n 
0000000411 00000 n 
0000000477 00000 n 

trailer
<<
/Size 9005
/Root 9004 0 R
>>

startxref
533
%%EOF`,
);

describe(`PDFWriter`, () => {
  it(`serializes PDFContext objects using Indirect Objects and a Cross Reference table`, async () => {
    const context = PDFContext.create();

    const contentStream = context.flateStream(contentStreamText);
    const contentStreamRef = PDFRef.of(9000);
    context.assign(contentStreamRef, contentStream);

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
    context.trailerInfo.Root = context.register(catalog);

    const buffer = await PDFWriter.forContext(
      context,
      Infinity,
    ).serializeToBuffer();

    expect(buffer.length).toBe(pdfBytes.length);
    expect(buffer).toEqual(pdfBytes);
  });
});
