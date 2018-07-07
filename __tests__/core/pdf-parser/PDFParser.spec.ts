import fs from 'fs';
import pako from 'pako';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';
import {
  PDFArray,
  PDFDictionary,
  PDFIndirectReference,
  PDFRawStream,
} from 'core/pdf-objects';
import PDFParser from 'core/pdf-parser/PDFParser';
import {
  PDFCatalog,
  PDFHeader,
  PDFPage,
  PDFPageTree,
  PDFTrailer,
  PDFXRef,
} from 'core/pdf-structures';
import { mergeUint8Arrays, typedArrayFor } from 'utils';

const objectStream = fs.readFileSync(
  './__tests__/core/pdf-parser/data/object-stream1',
);

// Note that this isn't necessarily a valid semantically. E.g. you might not be
// able to open this in a PDF reader. But it _is_ valid syntactially, which is
// all the parser really cares about. So it's perfectly valid for this test.
const PDF_DOCUMENT = mergeUint8Arrays(
  typedArrayFor(`
%PDF-1.6
%¥±ë

1 0 obj
  << /Type /Catalog /Pages 2 0 R >>
endobj

2 0 obj
  << /Type /Pages /Kids [3 0 R] /Count 1 /MediaBox [0 0 300 144] >>
endobj

3 0 obj
  <<  /Type /Page
      /Parent 2 0 R
      /Resources
       << /Font
           << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >> >>
       >>
      /Contents 4 0 R
  >>
endobj

4 0 obj
  << /Length 55 >>
stream
  BT
    /F1 18 Tf
    0 0 Td
    (Hello World) Tj
  ET
endstream
endobj

xref
0 5
0000000000 65535 f
0000000018 00000 n
0000000077 00000 n
0000000178 00000 n
0000000457 00000 n
trailer
  << /Root 1 0 R /Size 5 /ID [<ABC123><123ABC>] >>
startxref
565
%%EOF

5 0 obj
 << /Type /ObjStm /Length 213 /First 18 /N 3 /Filter /FlateDecode >>
stream
`),
  pako.deflate(objectStream),
  typedArrayFor(`
endstream
endobj

xref
5 1
0000000523 00000 n
trailer
  << /Root 1 0 R /Size 5 /ID [<ABC123><123ABC>] >>
startxref
700
%%EOF
`),
);

describe(`PDFParser`, () => {
  it(`parses PDF documents into IParsedPDF objects`, () => {
    const parser = new PDFParser();
    const res = parser.parse(PDF_DOCUMENT, PDFObjectIndex.create());

    expect(res.arrays).toHaveLength(4);
    expect(res.dictionaries).toHaveLength(14);
    expect(res.updates).toHaveLength(1);
    expect(res).toEqual({
      maxObjectNumber: 5,
      catalog: expect.any(PDFCatalog),
      arrays: expect.any(Array),
      dictionaries: expect.any(Array),
      original: {
        header: expect.any(PDFHeader),
        body: expect.any(Map),
        linearization: undefined,
        xRefTable: expect.any(PDFXRef.Table),
        trailer: expect.any(PDFTrailer),
      },
      updates: expect.any(Array),
    });

    expect(res.dictionaries).toContainEqual(expect.any(PDFCatalog));
    expect(res.dictionaries).toContainEqual(expect.any(PDFPageTree));
    expect(res.dictionaries).toContainEqual(expect.any(PDFPage));

    // Header
    expect(res.original.header).toMatchObject({ major: 1, minor: 6 });

    // Original body
    expect(
      res.original.body.get(PDFIndirectReference.forNumbers(1, 0)).pdfObject,
    ).toEqual(expect.any(PDFCatalog));
    expect(
      res.original.body.get(PDFIndirectReference.forNumbers(2, 0)).pdfObject,
    ).toEqual(expect.any(PDFPageTree));
    expect(
      res.original.body.get(PDFIndirectReference.forNumbers(3, 0)).pdfObject,
    ).toEqual(expect.any(PDFPage));
    expect(
      res.original.body.get(PDFIndirectReference.forNumbers(4, 0)).pdfObject,
    ).toEqual(expect.any(PDFRawStream));

    // Original cross reference table
    expect(res.original.xRefTable.subsections).toHaveLength(1);
    expect(res.original.xRefTable.subsections[0].entries).toHaveLength(5);

    // Original trailer
    expect(res.original.trailer).toMatchObject({
      offset: 565,
      dictionary: expect.any(PDFDictionary),
    });

    // Updates
    expect(res.updates).toEqual([
      {
        body: expect.any(Map),
        xRefTable: expect.any(PDFXRef.Table),
        trailer: expect.any(PDFTrailer),
      },
    ]);

    // Update body
    expect(
      res.updates[0].body.get(PDFIndirectReference.forNumbers(11, 0)).pdfObject,
    ).toEqual(expect.any(PDFDictionary));
    expect(
      res.updates[0].body.get(PDFIndirectReference.forNumbers(12, 0)).pdfObject,
    ).toEqual(expect.any(PDFDictionary));
    expect(
      res.updates[0].body.get(PDFIndirectReference.forNumbers(13, 0)).pdfObject,
    ).toEqual(expect.any(PDFDictionary));

    // Update cross reference table
    expect(res.updates[0].xRefTable.subsections).toHaveLength(1);
    expect(res.updates[0].xRefTable.subsections[0].entries).toHaveLength(1);

    // Update trailer
    expect(res.updates[0].trailer).toMatchObject({
      offset: 700,
      dictionary: expect.any(PDFDictionary),
    });
  });
});
