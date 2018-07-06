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
import parseDict from 'core/pdf-parser/parseDict';
import {
  PDFCatalog,
  PDFLinearizationParams,
  PDFPage,
  PDFPageTree,
} from 'core/pdf-structures';
import { typedArrayFor } from 'utils';

describe(`parseDict`, () => {
  it(`parses a single PDF Dictionary object from its input array`, () => {
    const input = typedArrayFor('<< /Foo (Bar) >><< /Qux (Baz) >>');
    const res = parseDict(input, PDFObjectIndex.create());
    expect(res).toEqual([expect.any(PDFDictionary), expect.any(Uint8Array)]);

    const fooVal = res[0].get('Foo');
    expect(fooVal).toEqual(expect.any(PDFString));
    expect(fooVal.string).toEqual('Bar');
    expect(res[1]).toEqual(typedArrayFor('<< /Qux (Baz) >>'));
  });

  it(`returns undefined when the leading input is not a PDF Dictionary`, () => {
    const input = typedArrayFor('[(foo)] << /Qux /Baz >>');
    const res = parseDict(input, PDFObjectIndex.create());
    expect(res).toBeUndefined();
  });

  it(`invokes the "onParseDict" parseHandler with the parsed PDFArray object`, () => {
    const parseHandlers = {
      onParseDict: jest.fn(),
    };
    const input = typedArrayFor('<< /Foo /Bar >>');
    parseDict(input, PDFObjectIndex.create(), parseHandlers);
    expect(parseHandlers.onParseDict).toHaveBeenCalledWith(
      expect.any(PDFDictionary),
    );
  });

  it(`allows leading whitespace and line endings before & after the PDF Dictionary object`, () => {
    const input = typedArrayFor(' \n \r\n << /Foo /Bar >> \r\n [(foo)]');
    const res = parseDict(input, PDFObjectIndex.create());
    expect(res).toEqual([expect.any(PDFDictionary), expect.any(Uint8Array)]);

    expect(res[0].get('Foo')).toBe(PDFName.from('Bar'));
    expect(res[1]).toEqual(typedArrayFor('[(foo)]'));
  });

  it(`parses nested PDF Dictionaries`, () => {
    const input = typedArrayFor(
      '<< /First << /Second << /Third (Foo) >> >> >>',
    );
    const res = parseDict(input, PDFObjectIndex.create());

    expect(res[0].get('First')).toEqual(expect.any(PDFDictionary));
    expect(res[0].get('First').get('Second')).toEqual(
      expect.any(PDFDictionary),
    );
    expect(
      res[0]
        .get('First')
        .get('Second')
        .get('Third'),
    ).toEqual(expect.any(PDFString));
  });

  it(`throws an error if mismatched brackets are found`, () => {
    const input = typedArrayFor('<< /FOO >');
    expect(() => parseDict(input, PDFObjectIndex.create())).toThrowError();
  });

  it(`can parse dictionaries containing elements of the following PDF data types: [
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
    const input = typedArrayFor(`
      <<
        /PDFName /Foo
        /PDFDictionary << /Key /Val >>
        /PDFArray [1 (2)]
        /PDFString (Look, a string!)
        /PDFIndirectReference 21 0 R
        /PDFNumber -.123
        /PDFHexString <ABC123>
        /PDFBoolean true
        /PDFNull null
      >>
    `);
    const res = parseDict(input, PDFObjectIndex.create());
    expect(res[0].get('PDFName')).toEqual(expect.any(PDFName));
    expect(res[0].get('PDFDictionary')).toEqual(expect.any(PDFDictionary));
    expect(res[0].get('PDFArray')).toEqual(expect.any(PDFArray));
    expect(res[0].get('PDFString')).toEqual(expect.any(PDFString));
    expect(res[0].get('PDFIndirectReference')).toEqual(
      expect.any(PDFIndirectReference),
    );
    expect(res[0].get('PDFNumber')).toEqual(expect.any(PDFNumber));
    expect(res[0].get('PDFHexString')).toEqual(expect.any(PDFHexString));
    expect(res[0].get('PDFBoolean')).toEqual(expect.any(PDFBoolean));
    expect(res[0].get('PDFNull')).toEqual(expect.any(PDFNull));
  });

  it(`forwards its parseHandlers onto its parsed entries`, () => {
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
    const input = typedArrayFor(`
      <<
        /PDFName /Foo
        /PDFDictionary << /Key /Val >>
        /PDFArray [1 (2)]
        /PDFString (Look, a string!)
        /PDFIndirectReference 21 0 R
        /PDFNumber -.123
        /PDFHexString <ABC123>
        /PDFBoolean true
        /PDFNull null
      >>
    `);
    const res = parseDict(input, PDFObjectIndex.create(), parseHandlers);
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

  it(`throws an error if it fails to parse a key`, () => {
    const input = typedArrayFor('<< FOO_BAR_LOLZ /Val >>');
    expect(() => parseDict(input, PDFObjectIndex.create())).toThrowError();
  });

  it(`throws an error if it fails to parse a value`, () => {
    const input = typedArrayFor('<< /Key FOO_BAR_LOLZ >>');
    expect(() => parseDict(input, PDFObjectIndex.create())).toThrowError();
  });

  it(`can parse dictionaries without spaces between brackets, keys, or values`, () => {
    const input = typedArrayFor(
      '<</Matrix [1 0 0 1 0 0]/Length 96/Resources<</ProcSet [/PDF /Text /ImageB /ImageC /ImageI]/Font<</ArialMT 2 0 R>>>>/Filter/FlateDecode/BBox[0 0 30.33 9.36]/Type/XObject/Subtype/Form/FormType 1>>',
    );
    const res = parseDict(input, PDFObjectIndex.create());
    expect(res[0].get('Matrix')).toEqual(expect.any(PDFArray));
    expect(res[0].get('Length')).toEqual(expect.any(PDFNumber));
    expect(res[0].get('Resources')).toEqual(expect.any(PDFDictionary));
    expect(res[0].get('Filter')).toEqual(expect.any(PDFName));
    expect(res[0].get('BBox')).toEqual(expect.any(PDFArray));
    expect(res[0].get('Type')).toEqual(expect.any(PDFName));
    expect(res[0].get('Subtype')).toEqual(expect.any(PDFName));
    expect(res[0].get('FormType')).toEqual(expect.any(PDFNumber));
  });

  it(`can parse entries for date strings`, () => {
    const input = typedArrayFor(`<< /ModDate(D:20170322102501-05'00') >>`);
    const res = parseDict(input, PDFObjectIndex.create());
    expect(res[0].get('ModDate')).toEqual(expect.any(PDFString));
  });

  it(`can parse PDF Boolean values without a space between the closing tags`, () => {
    const input = typedArrayFor(`<< /Foo true>>`);
    const res = parseDict(input, PDFObjectIndex.create());
    expect(res[0].get('Foo')).toEqual(expect.any(PDFBoolean));
  });

  it(`returns PDFLinearizationParams objects for PDF Dictionaries whose "Linearized" is defined`, () => {
    const input = typedArrayFor(`<< /Linearized 1 >>`);
    const res = parseDict(input, PDFObjectIndex.create());
    expect(res[0]).toEqual(expect.any(PDFLinearizationParams));
  });

  it(`returns PDFCatalog objects for PDF Dictionaries whose "Type" is equal to /Catalog`, () => {
    const input = typedArrayFor('<< /Type /Catalog >>');
    const res = parseDict(input, PDFObjectIndex.create());
    expect(res[0]).toEqual(expect.any(PDFCatalog));
  });

  it(`returns PDFPageTree objects for PDF Dictionaries whose "Type" is equal to /Pages`, () => {
    const input = typedArrayFor('<< /Type /Pages >>');
    const res = parseDict(input, PDFObjectIndex.create());
    expect(res[0]).toEqual(expect.any(PDFPageTree));
  });

  it(`returns PDFPage objects for PDF Dictionaries whose "Type" is equal to /Page`, () => {
    const input = typedArrayFor('<< /Type /Page >>');
    const res = parseDict(input, PDFObjectIndex.create());
    expect(res[0]).toEqual(expect.any(PDFPage));
  });
});
