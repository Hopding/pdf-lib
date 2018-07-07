import fs from 'fs';
import pako from 'pako';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';
import {
  PDFDictionary,
  PDFName,
  PDFNumber,
  PDFRawStream,
  PDFStream,
} from 'core/pdf-objects';
import parseDict from 'core/pdf-parser/parseDict';
import parseStream from 'core/pdf-parser/parseStream';
import { PDFObjectStream } from 'core/pdf-structures';
import { arrayToString, mergeUint8Arrays, typedArrayFor } from 'utils';

/*
  Note: All of the streams defined for these tests include an "endobj"
        keyword at the end of the stream, because the "parseStream"
        function depends upon its presence.
        The "endobj" keyword is not _technically_ part of a PDF Stream
        object, but it will always be present immediately after a PDF
        Stream object in real PDF files. So it is safe to rely upon when
        parsing.
 */

describe(`parseStream`, () => {
  describe(`when parsing "traditional" streams`, () => {
    it(`parses a single PDF Stream object from its input array`, () => {
      const input = typedArrayFor(
        `stream\n...HERE IS SOME ARBITRARY AND POTENTIALLY BINARY CONTENT...\nendstreamendobj` +
          `stream\n...OTHER STUFF...\nendstreamendobj`,
      );
      const index = PDFObjectIndex.create();
      const res = parseStream(input, PDFDictionary.from({}, index), index);
      expect(res).toEqual([expect.any(PDFRawStream), expect.any(Uint8Array)]);
      expect(res[0].content).toEqual(
        typedArrayFor(
          `...HERE IS SOME ARBITRARY AND POTENTIALLY BINARY CONTENT...`,
        ),
      );
      expect(res[1]).toEqual(
        typedArrayFor(`endobjstream\n...OTHER STUFF...\nendstreamendobj`),
      );
    });

    it(`returns undefined when the leading input is not a PDF Stream`, () => {
      const input = typedArrayFor(`(1 2)stream\nFOO_BAR\nendstreamendobj`);
      const index = PDFObjectIndex.create();
      const res = parseStream(input, PDFDictionary.from({}, index), index);
      expect(res).toBeUndefined();
    });

    it(`invokes the "onParseStream" parseHandler with the parsing a PDFStream object`, () => {
      const parseHandlers = {
        onParseStream: jest.fn(),
      };
      const input = typedArrayFor(`stream\nFOO_BAR\nendstreamendobj`);
      const index = PDFObjectIndex.create();
      const res = parseStream(
        input,
        PDFDictionary.from({}, index),
        index,
        parseHandlers,
      );
      expect(parseHandlers.onParseStream).toHaveBeenCalledWith(
        expect.any(PDFRawStream),
      );
    });

    it(`can parse PDF Stream objects with a carriage return and a newline following the "stream" keyword`, () => {
      const input = typedArrayFor(
        `stream\r\n Stuff and Things \nendstreamendobj`,
      );
      const index = PDFObjectIndex.create();
      const res = parseStream(input, PDFDictionary.from({}, index), index);
      expect(res).toEqual([expect.any(PDFRawStream), expect.any(Uint8Array)]);
    });

    it(`can parse PDF Stream objects with a carriage return preceding the "endstream" keyword`, () => {
      const input = typedArrayFor(
        `stream\r\n Stuff and Things \rendstreamendobj`,
      );
      const index = PDFObjectIndex.create();
      const res = parseStream(input, PDFDictionary.from({}, index), index);
      expect(res).toEqual([expect.any(PDFRawStream), expect.any(Uint8Array)]);
    });

    it(`throws an error when there is a missing/invalid "endstream" keyword`, () => {
      const input = typedArrayFor(
        `stream\r\n Stuff and Things \rndstreamendobj`,
      );
      const index = PDFObjectIndex.create();
      expect(() =>
        parseStream(input, PDFDictionary.from({}, index), index),
      ).toThrowError();
    });

    it(`throws an error when the "endobj" keyword does not follow the "endstream" keyword`, () => {
      const input = typedArrayFor(
        `stream\r\n Stuff and Things \rendstreamSTUFFendobj`,
      );
      const index = PDFObjectIndex.create();
      expect(() =>
        parseStream(input, PDFDictionary.from({}, index), index),
      ).toThrowError();
    });

    // https://github.com/Hopding/pdf-lib/issues/12#issuecomment-402871995
    it(`handles streams missing the EOL marker before the "endstream" keyword`, () => {
      const input = typedArrayFor(
        `stream\n...HERE IS SOME ARBITRARY AND POTENTIALLY BINARY CONTENT...endstreamendobj` +
          `stream\n...OTHER STUFF...\nendstreamendobj`,
      );
      const index = PDFObjectIndex.create();
      const res = parseStream(input, PDFDictionary.from({}, index), index);
      expect(res).toEqual([expect.any(PDFRawStream), expect.any(Uint8Array)]);
      expect(res[0].content).toEqual(
        typedArrayFor(
          `...HERE IS SOME ARBITRARY AND POTENTIALLY BINARY CONTENT...`,
        ),
      );
      expect(res[1]).toEqual(
        typedArrayFor(`endobjstream\n...OTHER STUFF...\nendstreamendobj`),
      );
    });
  });

  describe(`when parsing "object" streams`, () => {
    const objectStream = fs.readFileSync(
      './__tests__/core/pdf-parser/data/object-stream1',
    );
    const input = mergeUint8Arrays(
      typedArrayFor('stream\n'),
      pako.deflate(objectStream),
      typedArrayFor('\nendstream'),
    );
    const index = PDFObjectIndex.create();
    const dict = PDFDictionary.from(
      {
        Type: PDFName.from('ObjStm'),
        Filter: PDFName.from('FlateDecode'),
        Length: PDFNumber.fromNumber(objectStream.length),
        N: PDFNumber.fromNumber(3),
        First: PDFNumber.fromNumber(18),
      },
      index,
    );

    it(`can parse an object stream`, () => {
      const res = parseStream(input, dict, index);
      expect(res).toEqual([
        expect.any(PDFObjectStream),
        expect.any(Uint8Array),
      ]);
    });

    it(`invokes the "onParseStream" parseHandler with the parsing a PDFObjectStream object`, () => {
      const parseHandlers = {
        onParseObjectStream: jest.fn(),
      };
      const res = parseStream(input, dict, index, parseHandlers);
      expect(parseHandlers.onParseObjectStream).toHaveBeenCalledWith(
        expect.any(PDFObjectStream),
      );
    });

    it(`throws an error if the object stream is not FlateEncoded`, () => {
      const errDict = PDFDictionary.from(
        {
          Type: PDFName.from('ObjStm'),
          Length: PDFNumber.fromNumber(objectStream.length),
          N: PDFNumber.fromNumber(3),
          First: PDFNumber.fromNumber(18),
        },
        index,
      );
      expect(() => parseStream(input, errDict, index)).toThrowError();
    });
  });
});
