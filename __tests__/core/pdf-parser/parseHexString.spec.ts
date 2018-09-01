import { PDFHexString } from 'core/pdf-objects';
import parseHexString from 'core/pdf-parser/parseHexString';
import { charCodes, trimArray, typedArrayFor } from 'utils';

describe(`parseHexString`, () => {
  it(`parses a single PDF Hex String from its input array`, () => {
    const input = typedArrayFor('<ABC123><AND STUFF>');
    const res = parseHexString(input);
    expect(res).toEqual([expect.any(PDFHexString), expect.any(Uint8Array)]);
    expect(res[0].string).toEqual('ABC123');
    expect(res[1]).toEqual(typedArrayFor('<AND STUFF>'));
  });

  it(`returns undefined when leading input is not a PDF Hex String`, () => {
    const input = typedArrayFor('(FOOBAR)<ABD123>');
    const res = parseHexString(input);
    expect(res).toBeUndefined();
  });

  it(`invokes the "onParseHexString" parseHandler with the parsed PDFHexString object`, () => {
    const parseHandlers = {
      onParseHexString: jest.fn(),
    };
    const input = typedArrayFor('<ABC123>');
    parseHexString(input, parseHandlers);
    expect(parseHandlers.onParseHexString).toHaveBeenCalledWith(
      expect.any(PDFHexString),
    );
  });

  it(`allows leading whitespace and line endings before & after the PDF Hex String object`, () => {
    const input = typedArrayFor(
      '\u0000\t\n\f\r <\fA\nB C12\t3>\u0000\t\n\f\r (FOOBAR)',
    );
    const res = parseHexString(input);
    expect(res).toEqual([expect.any(PDFHexString), expect.any(Uint8Array)]);
    expect(res[0].string).toEqual('\fA\nB C12\t3');
    expect(res[1]).toEqual(typedArrayFor('\u0000\t\n\f\r (FOOBAR)'));
  });

  it(`handles empty input`, () => {
    const input = typedArrayFor('\u0000\t\n\f\r ');
    const res = parseHexString(input);
    expect(res).toBeUndefined();
  });
});
