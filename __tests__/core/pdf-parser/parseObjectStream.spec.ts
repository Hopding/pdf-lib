import fs from 'fs';

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
import parseObjectStream from 'core/pdf-parser/parseObjectStream';
import { PDFObjectStream } from 'core/pdf-structures';
import { typedArrayFor } from 'utils';

describe(`parseObjectStream`, () => {
  it(`parses a PDF Object Stream from its input array`, () => {
    const input = fs.readFileSync(
      './__tests__/core/pdf-parser/data/object-stream1',
    );
    const index = PDFObjectIndex.create();
    const dict = PDFDictionary.from(
      {
        Length: PDFNumber.fromNumber(input.length),
        N: PDFNumber.fromNumber(3),
        First: PDFNumber.fromNumber(18),
      },
      index,
    );
    const res = parseObjectStream(dict, input, index);
    expect(res).toEqual(expect.any(PDFObjectStream));
  });

  it(`can parse object streams containing the following PDF Object types: [
    PDFDictionary,
    PDFArray
    PDFName,
    PDFString,
    PDFIndirectReference,
    PDFNumber,
    PDFHexString,
    PDFBoolean,
    PDFNull
  ]`, () => {
    const input = fs.readFileSync(
      './__tests__/core/pdf-parser/data/object-stream2',
    );
    const index = PDFObjectIndex.create();
    const dict = PDFDictionary.from(
      {
        Length: PDFNumber.fromNumber(input.length),
        N: PDFNumber.fromNumber(9),
        First: PDFNumber.fromNumber(44),
      },
      index,
    );
    const res = parseObjectStream(dict, input, index);

    expect(res).toEqual(expect.any(PDFObjectStream));
    expect(res.dictionary).toBe(dict);

    expect(res.objects[0].reference).toEqual(
      PDFIndirectReference.forNumbers(1, 0),
    );
    expect(res.objects[0].pdfObject).toEqual(expect.any(PDFDictionary));

    expect(res.objects[1].reference).toEqual(
      PDFIndirectReference.forNumbers(2, 0),
    );
    expect(res.objects[1].pdfObject).toEqual(expect.any(PDFArray));

    expect(res.objects[2].reference).toEqual(
      PDFIndirectReference.forNumbers(3, 0),
    );
    expect(res.objects[2].pdfObject).toEqual(expect.any(PDFName));

    expect(res.objects[3].reference).toEqual(
      PDFIndirectReference.forNumbers(4, 0),
    );
    expect(res.objects[3].pdfObject).toEqual(expect.any(PDFString));

    expect(res.objects[4].reference).toEqual(
      PDFIndirectReference.forNumbers(5, 0),
    );
    expect(res.objects[4].pdfObject).toEqual(expect.any(PDFIndirectReference));

    expect(res.objects[5].reference).toEqual(
      PDFIndirectReference.forNumbers(6, 0),
    );
    expect(res.objects[5].pdfObject).toEqual(expect.any(PDFNumber));

    expect(res.objects[6].reference).toEqual(
      PDFIndirectReference.forNumbers(7, 0),
    );
    expect(res.objects[6].pdfObject).toEqual(expect.any(PDFHexString));

    expect(res.objects[7].reference).toEqual(
      PDFIndirectReference.forNumbers(8, 0),
    );
    expect(res.objects[7].pdfObject).toEqual(expect.any(PDFBoolean));

    expect(res.objects[8].reference).toEqual(
      PDFIndirectReference.forNumbers(9, 0),
    );
    expect(res.objects[8].pdfObject).toEqual(expect.any(PDFNull));
  });

  it(`forwards its parseHandlers onto its parsed objects`, () => {
    const input = fs.readFileSync(
      './__tests__/core/pdf-parser/data/object-stream2',
    );
    const index = PDFObjectIndex.create();
    const dict = PDFDictionary.from(
      {
        Length: PDFNumber.fromNumber(input.length),
        N: PDFNumber.fromNumber(9),
        First: PDFNumber.fromNumber(44),
      },
      index,
    );
    const parseHandlers = {
      onParseDict: jest.fn(),
      onParseArray: jest.fn(),
      onParseName: jest.fn(),
      onParseString: jest.fn(),
      onParseIndirectRef: jest.fn(),
      onParseNumber: jest.fn(),
      onParseHexString: jest.fn(),
      onParseBool: jest.fn(),
      onParseNull: jest.fn(),
    };
    const res = parseObjectStream(dict, input, index, parseHandlers);
    Object.values(parseHandlers).forEach((handler) => {
      expect(handler).toHaveBeenCalled();
    });
  });
  it(`throws an error when it fails to parse an object in the stream`, () => {
    const input = fs.readFileSync(
      './__tests__/core/pdf-parser/data/object-stream-invalid',
    );
    const index = PDFObjectIndex.create();
    const dict = PDFDictionary.from(
      {
        Length: PDFNumber.fromNumber(input.length),
        N: PDFNumber.fromNumber(1),
        First: PDFNumber.fromNumber(3),
      },
      index,
    );
    expect(() => parseObjectStream(dict, input, index)).toThrowError();
  });
});
