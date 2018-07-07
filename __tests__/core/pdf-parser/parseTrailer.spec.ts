import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';
import { PDFDictionary, PDFIndirectReference } from 'core/pdf-objects';
import {
  parseTrailer,
  parseTrailerWithoutDict,
} from 'core/pdf-parser/parseTrailer';
import { PDFTrailer } from 'core/pdf-structures';
import { typedArrayFor } from 'utils';

describe(`parseTrailer`, () => {
  it(`parses a single PDF Trailer object from its input array`, () => {
    const input = typedArrayFor(`
      trailer
      << /Root 1 0 R /Size 5 >>
      startxref
      565
      %%EOF
      trailer
      << /Root 1 0 R /Size 5 >>
      startxref
      565
      %%EOF
    `);
    const res = parseTrailer(input, PDFObjectIndex.create());
    expect(res).toEqual([expect.any(PDFTrailer), expect.any(Uint8Array)]);
    expect(res[0].offset).toEqual(565);
    expect(res[0].dictionary).toEqual(expect.any(PDFDictionary));
    expect(res[0].dictionary.get('Root')).toEqual(
      PDFIndirectReference.forNumbers(1, 0),
    );
    // prettier-ignore
    expect(res[1]).toEqual(typedArrayFor(`
      trailer
      << /Root 1 0 R /Size 5 >>
      startxref
      565
      %%EOF
    `));
  });

  it(`returns undefined when the leading input is not a PDF Trailer`, () => {
    const input = typedArrayFor(`(Look, I'm a string!)`);
    const res = parseTrailer(input, PDFObjectIndex.create());
    expect(res).toBeUndefined();
  });

  it(`invokes the "onParseTrailer" parseHandler with the parsed PDFTrailer object`, () => {
    const parseHandlers = {
      onParseTrailer: jest.fn(),
    };
    const input = typedArrayFor(`
      trailer
      << /Root 1 0 R /Size 5 >>
      startxref
      565
      %%EOF
    `);
    parseTrailer(input, PDFObjectIndex.create(), parseHandlers);
    expect(parseHandlers.onParseTrailer).toHaveBeenCalledWith(
      expect.any(PDFTrailer),
    );
  });

  it(`throws an error if it fails to parse the trailer's dictionary`, () => {
    const input = typedArrayFor(`
      trailer
      (I'm supposed to be a dictionary!)
      startxref
      565
      %%EOF
    `);
    expect(() => parseTrailer(input, PDFObjectIndex.create())).toThrowError();
  });
});

describe(`parseTrailerWithoutDict`, () => {
  it(`parses a single PDF Trailer object from its input array`, () => {
    const input = typedArrayFor(`
      startxref
      565
      %%EOF
      startxref
      565
      %%EOF
    `);
    const res = parseTrailerWithoutDict(input, PDFObjectIndex.create());
    expect(res).toEqual([expect.any(PDFTrailer), expect.any(Uint8Array)]);
    expect(res[0].offset).toEqual(565);
    // prettier-ignore
    expect(res[1]).toEqual(typedArrayFor(`
      startxref
      565
      %%EOF
    `));
  });

  it(`returns undefined when the leading input is not a PDF Trailer`, () => {
    const input = typedArrayFor(`(Look, I'm a string!)`);
    const res = parseTrailerWithoutDict(input, PDFObjectIndex.create());
    expect(res).toBeUndefined();
  });

  it(`invokes the "onParseTrailer" parseHandler with the parsed PDFTrailer object`, () => {
    const parseHandlers = {
      onParseTrailer: jest.fn(),
    };
    const input = typedArrayFor(`
      startxref
      565
      %%EOF
    `);
    parseTrailerWithoutDict(input, PDFObjectIndex.create(), parseHandlers);
    expect(parseHandlers.onParseTrailer).toHaveBeenCalledWith(
      expect.any(PDFTrailer),
    );
  });
});
