/* tslint:disable:ban-types */
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
import parseIndirectObj from 'core/pdf-parser/parseIndirectObj';
import { typedArrayFor } from 'utils';

const FOOBAR = typedArrayFor(`
  7\u0000\t\n\f\r 0\u0000\t\n\f\r obj
    << /Length 8 0 R >>
  stream
    BT
      /F1 12 Tf
      72 712 Td
      (A stream with an indirect length) Tj
    ET
  \nendstream
  endobj
  8 0 obj
    77
  endobj
`);

describe(`parseIndirectObj`, () => {
  it(`parses a single PDF Indirect Object from its input array`, () => {
    const input = typedArrayFor(
      `0 1 obj\n(I'm a little teapot)\nendobj` +
        `0 2 obj\n<< /Foo /Bar >>\nendobj`,
    );
    const res = parseIndirectObj(input, PDFObjectIndex.create());
    expect(res).toEqual([
      expect.any(PDFIndirectObject),
      expect.any(Uint8Array),
    ]);
    expect(res[0].pdfObject).toEqual(expect.any(PDFString));
    expect(res[0].pdfObject.string).toEqual(`I'm a little teapot`);
    expect(res[0].reference).toEqual(PDFIndirectReference.forNumbers(0, 1));
    expect(res[1]).toEqual(typedArrayFor(`0 2 obj\n<< /Foo /Bar >>\nendobj`));
  });

  it(`returns undefined when leading input is not a PDF Indirect Object`, () => {
    const input = typedArrayFor(`(foobar)0 1 obj\n[/Foo]\nendobj`);
    const res = parseIndirectObj(input, PDFObjectIndex.create());
    expect(res).toBeUndefined();
  });

  it(`invokes the "onParseIndirectObj" parseHandler with the parsed PDFArray object`, () => {
    const parseHandlers = {
      onParseIndirectObj: jest.fn(),
    };
    const input = typedArrayFor(`0 1 obj\n<< /Foo /Bar >>\nendobj`);
    parseIndirectObj(input, PDFObjectIndex.create(), parseHandlers);
    expect(parseHandlers.onParseIndirectObj).toHaveBeenCalledWith(
      expect.any(PDFIndirectObject),
    );
  });

  it(`allows leading whitespace and line endings before & after the PDF Indirect Object`, () => {
    const input = typedArrayFor(
      ` \n \r\n 0 1 obj\n<< /Foo /Bar >>\nendobj \r\n [(foo)]`,
    );
    const res = parseIndirectObj(input, PDFObjectIndex.create());
    expect(res).toEqual([
      expect.any(PDFIndirectObject),
      expect.any(Uint8Array),
    ]);

    expect(res[0]).toEqual(expect.any(PDFIndirectObject));
    expect(res[1]).toEqual(typedArrayFor(` \r\n [(foo)]`));
  });

  it(`throws an error if it fails to parse the PDF Indirect Object's contents`, () => {
    const input = typedArrayFor(`0 1 obj\nFOO_BAR_LOLZ\nendobj`);
    expect(() =>
      parseIndirectObj(input, PDFObjectIndex.create()),
    ).toThrowError();
  });

  it(`throws an error if it Incorrectly parses the PDF Indirect Object's contents`, () => {
    const input = typedArrayFor(`0 1 obj\n[]]\nendobj`);
    expect(() =>
      parseIndirectObj(input, PDFObjectIndex.create()),
    ).toThrowError();
  });

  const pdfObjectsArr = [
    [PDFDictionary, 'onParseDict', '<< /Foo /Bar >>'],
    [
      PDFStream,
      'onParseStream',
      `
        << /Foo /Bar >>
        stream
         FOO BAR AND QUX BAZ
        \nendstream
      `,
    ],
    [PDFArray, 'onParseArray', '[1 (foo) /Bar]'],
    [PDFName, 'onParseName', '/Foo'],
    [PDFString, 'onParseString', '(Foo Bar)'],
    [PDFIndirectReference, 'onParseIndirectRef', '21 0 R'],
    [PDFNumber, 'onParseNumber', '-.123'],
    [PDFHexString, 'onParseHexString', '<ABC123>'],
    [PDFBoolean, 'onParseBool', 'true'],
    [PDFNull, 'onParseNull', 'null'],
  ] as Array<[Function, string, string]>;

  pdfObjectsArr.forEach(([type, handler, objString]) => {
    it(`can parse an indirect object for a ${type.name}`, () => {
      const input = typedArrayFor(`0 1 obj\n${objString}\nendobj`);
      const res = parseIndirectObj(input, PDFObjectIndex.create());
      expect(res[0].pdfObject).toEqual(expect.any(type));
    });
  });

  pdfObjectsArr.forEach(([type, handler, objString]) => {
    it(`forwards its parseHandlers onto ${type.name}s`, () => {
      const parseHandlers = {
        onParseDict: jest.fn(),
        onParseStream: jest.fn(),
        onParseArray: jest.fn(),
        onParseName: jest.fn(),
        onParseString: jest.fn(),
        onParseIndirectRef: jest.fn(),
        onParseNumber: jest.fn(),
        onParseHexString: jest.fn(),
        onParseBool: jest.fn(),
        onParseNull: jest.fn(),
      };
      const input = typedArrayFor(`0 1 obj\n${objString}\nendobj`);
      const res = parseIndirectObj(
        input,
        PDFObjectIndex.create(),
        parseHandlers,
      );
      expect(parseHandlers[handler]).toHaveBeenCalledWith(expect.any(type));
    });
  });

  it(`handles empty input`, () => {
    const input = typedArrayFor('\u0000\t\n\f\r ');
    const res = parseIndirectObj(input, PDFObjectIndex.create());
    expect(res).toBeUndefined();
  });
});
