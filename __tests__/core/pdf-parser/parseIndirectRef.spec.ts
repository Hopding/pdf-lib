import { PDFIndirectReference } from 'core/pdf-objects';
import parseIndirectRef from 'core/pdf-parser/parseIndirectRef';
import { typedArrayFor } from 'utils';

describe(`parseIndirectRef`, () => {
  it(`parses a single PDF Indirect Reference object from its input array`, () => {
    const input = typedArrayFor(`0 0 R1 1 R`);
    const res = parseIndirectRef(input);
    expect(res).toEqual([
      expect.any(PDFIndirectReference),
      expect.any(Uint8Array),
    ]);
    expect(res[0]).toEqual(PDFIndirectReference.forNumbers(0, 0));
    expect(res[1]).toEqual(typedArrayFor(`1 1 R`));
  });

  it(`returns undefined when the leading input is not a PDF Indirect Reference`, () => {
    const input = typedArrayFor(`(foo)1 1 R`);
    const res = parseIndirectRef(input);
    expect(res).toBeUndefined();
  });

  it(`invokes the "onParseIndirectRef" parseHandler with the parsed PDFIndirectReference object`, () => {
    const parseHandlers = {
      onParseIndirectRef: jest.fn(),
    };
    const input = typedArrayFor('210 36 R');
    parseIndirectRef(input, parseHandlers);
    expect(parseHandlers.onParseIndirectRef).toHaveBeenCalledWith(
      PDFIndirectReference.forNumbers(210, 36),
    );
  });

  it(`allows any valid whitespace characters to separate the object numbers`, () => {
    const input = typedArrayFor(`0\u0000\t\n\f\r0\u0000\t\n\f\rR`);
    const res = parseIndirectRef(input);
    expect(res).toEqual([
      expect.any(PDFIndirectReference),
      expect.any(Uint8Array),
    ]);
    expect(res[0]).toEqual(PDFIndirectReference.forNumbers(0, 0));
    expect(res[1]).toHaveLength(0);
  });

  it(`allows leading whitespace and line endings before & after the PDF Indirect Reference object`, () => {
    const input = typedArrayFor(
      '\u0000\t\n\f\r 0 2 R \u0000\t\n\f\r << /Key /Val >>',
    );
    const res = parseIndirectRef(input);
    expect(res).toEqual([
      PDFIndirectReference.forNumbers(0, 2),
      expect.any(Uint8Array),
    ]);
    expect(res[1]).toEqual(typedArrayFor(' \u0000\t\n\f\r << /Key /Val >>'));
  });

  it(`handles empty input`, () => {
    const input = typedArrayFor('\u0000\t\n\f\r ');
    const res = parseIndirectRef(input);
    expect(res).toBeUndefined();
  });
});
