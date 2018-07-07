import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';
import {
  PDFDictionary,
  PDFIndirectObject,
  PDFRawStream,
} from 'core/pdf-objects';
import parseLinearization from 'core/pdf-parser/parseLinearization';
import {
  PDFLinearizationParams,
  PDFTrailer,
  PDFXRef,
} from 'core/pdf-structures';
import { arrayToString, typedArrayFor } from 'utils';

const linearization1 = typedArrayFor(`
1 0 obj
<< /Linearized 1 /L 798176 /O 862 /E 229614 /N 3 /T 781108 /H [2996 734] >>
endobj

xref
3 1
0000229301 00000 n
0000003730 00000 n
0000002996 00000 n
trailer
<< /Size 983 /Prev 781096 /XRefStm 3730 /Root 852 0 R /Info 133 0 R >>
startxref
0
%%EOF
2 0 obj
(Look, a string!)
endobj
`);

const linearization2 = typedArrayFor(`
10 0 obj
  << /Linearized 1 /L 15636 /O 12 /E 10710 /N 1 /T 15334 /H [467 154] >>
endobj

20 0 obj
<<
  /Index [10 27]
  /Length 65
  /Root 11 0 R
  /Type /XRef
  /W [1 2 1]
>>
stream
  ...SOME BINARY ENCODED STUFF...
endstream
endobj
startxref
0
%%EOF
`);

const linearization3 = typedArrayFor(`
1 0 obj
<< /Linearized 1 /L 798176 /O 862 /E 229614 /N 3 /T 781108 /H [2996 734] >>
endobj

20 0 obj
<<
  /Index [10 27]
  /Length 65
  /Root 11 0 R
  /Type /XRef
  /W [1 2 1]
>>
stream
  ...SOME BINARY ENCODED STUFF...
endstream
endobj
2 0 obj
(Look, a string!)
endobj
`);

describe(`parseLinearization`, () => {
  it(`parses the Linearization Params dictionary, XRef table, and trailer from its leading input`, () => {
    const res = parseLinearization(linearization1, PDFObjectIndex.create());
    expect(res).toEqual([expect.any(Object), expect.any(Uint8Array)]);
    expect(res[0]).toEqual({
      paramDict: expect.any(PDFIndirectObject),
      xref: expect.any(PDFXRef.Table),
      trailer: expect.any(PDFTrailer),
    });
    expect(res[0].paramDict.pdfObject).toEqual(expect.any(PDFDictionary));
    expect(res[1]).toEqual(
      typedArrayFor(`\n2 0 obj\n(Look, a string!)\nendobj\n`),
    );
  });

  it(`parses the Linearization Params dictionary followed by an indirect stream object and the trailer`, () => {
    const res = parseLinearization(linearization2, PDFObjectIndex.create());
    expect(res).toEqual([expect.any(Object), expect.any(Uint8Array)]);
    expect(res[0]).toEqual({
      paramDict: expect.any(PDFIndirectObject),
      xref: expect.any(PDFIndirectObject),
      trailer: expect.any(PDFTrailer),
    });
    expect(res[0].paramDict.pdfObject).toEqual(expect.any(PDFDictionary));
    expect(res[0].xref.pdfObject).toEqual(expect.any(PDFRawStream));
  });

  it(`can parse linearization sections missing a trailer`, () => {
    const res = parseLinearization(linearization3, PDFObjectIndex.create());
    expect(res).toEqual([expect.any(Object), expect.any(Uint8Array)]);
    expect(res[0]).toEqual({
      paramDict: expect.any(PDFIndirectObject),
      xref: expect.any(PDFIndirectObject),
      trailer: undefined,
    });
    expect(res[0].paramDict.pdfObject).toEqual(expect.any(PDFDictionary));
  });

  it(`returns undefined when the leading input is not a PDF linearization`, () => {
    const input = typedArrayFor(`(I'm a string!)`);
    const res = parseLinearization(input, PDFObjectIndex.create());
    expect(res).toBeUndefined();
  });

  it(`invokes the "onParseLinearization" parseHandler with the parsed IPDFLinearization object`, () => {
    const parseHandlers = {
      onParseLinearization: jest.fn(),
    };
    parseLinearization(linearization1, PDFObjectIndex.create(), parseHandlers);
    expect(parseHandlers.onParseLinearization).toHaveBeenCalledWith({
      paramDict: expect.any(PDFIndirectObject),
      xref: expect.any(PDFXRef.Table),
      trailer: expect.any(PDFTrailer),
    });
  });

  it(`returns undefined if the leading indirect object is not a Linearization Param Dictionary`, () => {
    const input = typedArrayFor(`1 0 obj\n<< /Type /Catalog >>\nendobj`);
    const res = parseLinearization(input, PDFObjectIndex.create());
    expect(res).toBeUndefined();
  });

  it(`throws an error if a Linearization Param Dictionary is found, but no xref table or stream is found.`, () => {
    const input = typedArrayFor(`1 0 obj\n<< /Linearized 1 >>\nendobj`);
    expect(() =>
      parseLinearization(input, PDFObjectIndex.create()),
    ).toThrowError();
  });
});
