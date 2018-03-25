import { PDFHexString } from 'core/pdf-objects';
import parseHexString from 'core/pdf-parser/parseHexString';
import { charCodes, typedArrayFor } from 'utils';

describe(`parseHexString`, () => {
  it(`parses a single PDF Hex String from its input array`, () => {
    const input = typedArrayFor('<ABC123><AND STUFF>');
    const res = parseHexString(input);
    expect(res).toEqual([expect.any(PDFHexString), expect.any(Uint8Array)]);
    expect(res[0].string).toEqual('ABC123');
    expect(res[1]).toEqual(typedArrayFor('<AND STUFF>'));
  });

  it(`returns null when leading input is not a PDF Hex String`, () => {
    const input = typedArrayFor('(FOOBAR)<ABD123>');
    const res = parseHexString(input);
    expect(res).toBeNull();
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
    const input = typedArrayFor(' \n \r\n <ABC123> \r\n (FOOBAR)');
    const res = parseHexString(input);
    expect(res).toEqual([expect.any(PDFHexString), expect.any(Uint8Array)]);
    expect(res[0].string).toEqual('ABC123');
    expect(res[1]).toEqual(typedArrayFor(' \r\n (FOOBAR)'));
  });
});
