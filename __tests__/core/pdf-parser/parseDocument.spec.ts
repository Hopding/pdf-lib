import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';
import {
  PDFArray,
  PDFBoolean,
  PDFDictionary,
  PDFHexString,
  PDFIndirectObject,
  PDFIndirectReference,
  PDFName,
  PDFNull,
  PDFNumber,
  PDFStream,
  PDFString,
} from 'core/pdf-objects';
import parseDocument from 'core/pdf-parser/parseDocument';
import {
  PDFHeader,
  PDFObjectStream,
  PDFTrailer,
  PDFXRef,
} from 'core/pdf-structures';
import { typedArrayFor } from 'utils';

const PDF_DOCUMENT = typedArrayFor(`
%PDF-1.1
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
`);

describe(`parseDocument`, () => {
  it(`invokes the appropriate parseHandlers for each PDF Object/Structure it encounters in the document`, () => {
    const parseHandlers = {
      onParseBool: jest.fn(),
      onParseArray: jest.fn(),
      onParseDict: jest.fn(),
      onParseHexString: jest.fn(),
      onParseName: jest.fn(),
      onParseNull: jest.fn(),
      onParseNumber: jest.fn(),
      onParseString: jest.fn(),
      onParseStream: jest.fn(),
      onParseObjectStream: jest.fn(),
      onParseIndirectRef: jest.fn(),
      onParseIndirectObj: jest.fn(),
      onParseHeader: jest.fn(),
      onParseXRefTable: jest.fn(),
      onParseTrailer: jest.fn(),
      onParseLinearization: jest.fn(),
    };
    parseDocument(PDF_DOCUMENT, PDFObjectIndex.create(), parseHandlers);

    expect(parseHandlers.onParseBool).toHaveBeenCalledTimes(0);
    expect(parseHandlers.onParseBool).not.toHaveBeenCalledWith(
      expect.any(PDFBoolean),
    );

    expect(parseHandlers.onParseArray).toHaveBeenCalledTimes(3);
    expect(parseHandlers.onParseArray).toHaveBeenCalledWith(
      expect.any(PDFArray),
    );

    expect(parseHandlers.onParseDict).toHaveBeenCalledTimes(9);
    expect(parseHandlers.onParseDict).toHaveBeenCalledWith(
      expect.any(PDFDictionary),
    );

    expect(parseHandlers.onParseHexString).toHaveBeenCalledTimes(2);
    expect(parseHandlers.onParseHexString).toHaveBeenCalledWith(
      expect.any(PDFHexString),
    );

    expect(parseHandlers.onParseName).toHaveBeenCalledTimes(7);
    expect(parseHandlers.onParseName).toHaveBeenCalledWith(expect.any(PDFName));

    expect(parseHandlers.onParseNull).toHaveBeenCalledTimes(0);
    expect(parseHandlers.onParseNull).not.toHaveBeenCalledWith(
      expect.any(PDFNull),
    );

    expect(parseHandlers.onParseNumber).toHaveBeenCalledTimes(8);
    expect(parseHandlers.onParseNumber).toHaveBeenCalledWith(
      expect.any(PDFNumber),
    );

    expect(parseHandlers.onParseString).toHaveBeenCalledTimes(0);
    expect(parseHandlers.onParseString).not.toHaveBeenCalledWith(
      expect.any(PDFString),
    );

    expect(parseHandlers.onParseStream).toHaveBeenCalledTimes(1);
    expect(parseHandlers.onParseStream).toHaveBeenCalledWith(
      expect.any(PDFStream),
    );

    expect(parseHandlers.onParseObjectStream).toHaveBeenCalledTimes(0);
    expect(parseHandlers.onParseObjectStream).not.toHaveBeenCalledWith(
      expect.any(PDFObjectStream),
    );

    expect(parseHandlers.onParseIndirectRef).toHaveBeenCalledTimes(6);
    expect(parseHandlers.onParseIndirectRef).toHaveBeenCalledWith(
      expect.any(PDFIndirectReference),
    );

    // 5 times , instead of 4, because the first dict is parsed twice to check
    // if the PDF is linearized...
    expect(parseHandlers.onParseIndirectObj).toHaveBeenCalledTimes(5);
    expect(parseHandlers.onParseIndirectObj).toHaveBeenCalledWith(
      expect.any(PDFIndirectObject),
    );

    expect(parseHandlers.onParseHeader).toHaveBeenCalledTimes(1);
    expect(parseHandlers.onParseHeader).toHaveBeenCalledWith(
      expect.any(PDFHeader),
    );

    expect(parseHandlers.onParseXRefTable).toHaveBeenCalledTimes(1);
    expect(parseHandlers.onParseXRefTable).toHaveBeenCalledWith(
      expect.any(PDFXRef.Table),
    );

    expect(parseHandlers.onParseTrailer).toHaveBeenCalledTimes(1);
    expect(parseHandlers.onParseTrailer).toHaveBeenCalledWith(
      expect.any(PDFTrailer),
    );

    expect(parseHandlers.onParseLinearization).toHaveBeenCalledTimes(0);
  });
});
