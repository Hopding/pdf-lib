import { PDFNumber } from 'core/pdf-objects';
import parseNumber from 'core/pdf-parser/parseNumber';
import { charCodes, typedArrayFor } from 'utils';

describe(`parseNumber`, () => {
  it(`parses a single PDF Number object from its input array`, () => {
    const input = typedArrayFor('123.123.123');
    const res = parseNumber(input);
    expect(res).toEqual([expect.any(PDFNumber), expect.any(Uint8Array)]);
    expect(res[0].number).toEqual(123.123);
    expect(res[1]).toEqual(typedArrayFor('.123'));
  });

  it(`returns undefined when the leading input is not a PDF Number`, () => {
    const input = typedArrayFor('(123)123');
    const res = parseNumber(input);
    expect(res).toBeUndefined();
  });

  it(`invokes the "onParseNumber" parseHandler with the parsed PDFNumber object`, () => {
    const parseHandlers = {
      onParseNumber: jest.fn(),
    };
    const input = typedArrayFor('123');
    parseNumber(input, parseHandlers);
    expect(parseHandlers.onParseNumber).toHaveBeenCalledWith(
      expect.any(PDFNumber),
    );
  });

  it(`allows leading whitespace and line endings before & after the PDF Number object`, () => {
    const input = typedArrayFor(' \n \r\n .123 \r\n (foo)');
    const res = parseNumber(input);
    expect(res).toEqual([expect.any(PDFNumber), expect.any(Uint8Array)]);
    expect(res[0].number).toEqual(0.123);
    expect(res[1]).toEqual(typedArrayFor(' \r\n (foo)'));
  });

  it(`parses negative numbers`, () => {
    const input = typedArrayFor('-.123+.123');
    const res = parseNumber(input);
    expect(res).toEqual([expect.any(PDFNumber), expect.any(Uint8Array)]);
    expect(res[0].number).toEqual(-0.123);
    expect(res[1]).toEqual(typedArrayFor('+.123'));
  });

  it(`parses positive numbers`, () => {
    const input = typedArrayFor('+.123-.123');
    const res = parseNumber(input);
    expect(res).toEqual([expect.any(PDFNumber), expect.any(Uint8Array)]);
    expect(res[0].number).toEqual(0.123);
    expect(res[1]).toEqual(typedArrayFor('-.123'));
  });
});
