import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';
import {
  PDFArray,
  PDFBoolean,
  PDFDictionary,
  PDFHexString,
  PDFIndirectReference,
  PDFName,
  PDFNull,
  PDFNumber,
  PDFString,
} from 'core/pdf-objects';
import parseArray from 'core/pdf-parser/parseArray';
import { typedArrayFor } from 'utils';

describe(`parseArray`, () => {
  it(`parses a single PDF Array object from its input array`, () => {
    const input = typedArrayFor('[1 2][3 4]');
    const res = parseArray(input, PDFObjectIndex.create());
    expect(res).toEqual([expect.any(PDFArray), expect.any(Uint8Array)]);
    expect(res[0].array).toEqual([
      expect.any(PDFNumber),
      expect.any(PDFNumber),
    ]);
    expect(res[1]).toEqual(typedArrayFor('[3 4]'));
  });

  it(`returns undefined when the leading input is not a PDF Array`, () => {
    const input = typedArrayFor('1 2 [3 4]');
    const res = parseArray(input, PDFObjectIndex.create());
    expect(res).toBeUndefined();
  });

  it(`invokes the "onParseArray" parseHandler with the parsed PDFArray object`, () => {
    const parseHandlers = {
      onParseArray: jest.fn(),
    };
    const input = typedArrayFor('[(foo) /Bar]');
    parseArray(input, PDFObjectIndex.create(), parseHandlers);
    expect(parseHandlers.onParseArray).toHaveBeenCalledWith(
      expect.any(PDFArray),
    );
  });

  it(`allows leading whitespace and line endings before & after the PDF Array object`, () => {
    const input = typedArrayFor(' \n \r\n [(foo)] \r\n << /Key /Val >>');
    const res = parseArray(input, PDFObjectIndex.create());
    expect(res).toEqual([expect.any(PDFArray), expect.any(Uint8Array)]);
    expect(res[0].array).toEqual([expect.any(PDFString)]);
    expect(res[1]).toEqual(typedArrayFor('<< /Key /Val >>'));
  });

  it(`parses nested PDF Arrays`, () => {
    const input = typedArrayFor('[[[]]]');
    const res = parseArray(input, PDFObjectIndex.create());
    expect(res[0]).toEqual(expect.any(PDFArray));
    expect(res[0].array[0]).toEqual(expect.any(PDFArray));
    expect(res[0].array[0].array[0]).toEqual(expect.any(PDFArray));
  });

  it(`throws an error if mismatched brackets are found`, () => {
    const input = typedArrayFor('[(foo) []');
    expect(() => parseArray(input, PDFObjectIndex.create())).toThrowError();
  });

  it(`can parse arrays containing elements of the following PDF data types: [
      PDF Name,
      PDF Dictionary,
      PDF Array,
      PDF String,
      PDF Indirect Reference,
      PDF Number,
      PDF Hex String,
      PDF Boolean,
      PDF Null
    ]`, () => {
    const input = typedArrayFor(
      '[/Foo << /Key /Val >> [] (Bar) 21 0 R 0.56 <ABC123> true null]',
    );
    const res = parseArray(input, PDFObjectIndex.create());
    expect(res).toEqual([expect.any(PDFArray), expect.any(Uint8Array)]);
    expect(res[0].array).toEqual([
      expect.any(PDFName),
      expect.any(PDFDictionary),
      expect.any(PDFArray),
      expect.any(PDFString),
      expect.any(PDFIndirectReference),
      expect.any(PDFNumber),
      expect.any(PDFHexString),
      expect.any(PDFBoolean),
      expect.any(PDFNull),
    ]);
  });

  it(`forwards its parseHandlers onto its parsed elements`, () => {
    const parseHandlers = {
      onParseName: jest.fn(),
      onParseDict: jest.fn(),
      onParseArray: jest.fn(),
      onParseString: jest.fn(),
      onParseIndirectRef: jest.fn(),
      onParseNumber: jest.fn(),
      onParseHexString: jest.fn(),
      onParseBool: jest.fn(),
      onParseNull: jest.fn(),
    };
    const input = typedArrayFor(
      '[/Foo << /Key /Val >> [] (Bar) 21 0 R 0.56 <ABC123> true null]',
    );
    const res = parseArray(input, PDFObjectIndex.create(), parseHandlers);
    expect(parseHandlers.onParseName).toHaveBeenCalledWith(expect.any(PDFName));
    expect(parseHandlers.onParseDict).toHaveBeenCalledWith(
      expect.any(PDFDictionary),
    );
    expect(parseHandlers.onParseArray).toHaveBeenCalledWith(
      expect.any(PDFArray),
    );
    expect(parseHandlers.onParseString).toHaveBeenCalledWith(
      expect.any(PDFString),
    );
    expect(parseHandlers.onParseIndirectRef).toHaveBeenCalledWith(
      expect.any(PDFIndirectReference),
    );
    expect(parseHandlers.onParseNumber).toHaveBeenCalledWith(
      expect.any(PDFNumber),
    );
    expect(parseHandlers.onParseHexString).toHaveBeenCalledWith(
      expect.any(PDFHexString),
    );
    expect(parseHandlers.onParseBool).toHaveBeenCalledWith(
      expect.any(PDFBoolean),
    );
    expect(parseHandlers.onParseNull).toHaveBeenCalledWith(expect.any(PDFNull));
  });

  it(`throws an error if it fails to parse an element`, () => {
    const input = typedArrayFor('[FOO_BAR_LOLZ]');
    expect(() => parseArray(input, PDFObjectIndex.create())).toThrowError();
  });
});
