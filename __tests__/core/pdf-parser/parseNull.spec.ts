import { PDFNull } from 'core/pdf-objects';
import parseNull from 'core/pdf-parser/parseNull';
import { charCodes, typedArrayFor } from 'utils';

describe(`parseNull`, () => {
  it(`parses a single PDF Null object from its input array`, () => {
    const input = typedArrayFor('nullnull(foo)');
    const res = parseNull(input);
    expect(res).toEqual([PDFNull.instance, typedArrayFor('null(foo)')]);
  });

  it(`returns undefined when the leading input is not a PDF Null`, () => {
    const input = typedArrayFor('(foo)null');
    const res = parseNull(input);
    expect(res).toBeUndefined();
  });

  it(`invokes the "onParseNull" parseHandler with the parsed PDFNull object`, () => {
    const parseHandlers = {
      onParseNull: jest.fn(),
    };
    const input = typedArrayFor('null');
    const res = parseNull(input, parseHandlers);
    expect(parseHandlers.onParseNull).toHaveBeenCalledWith(PDFNull.instance);
  });

  it(`allows leading whitespace and line endings before & after the PDF Null object`, () => {
    const input = typedArrayFor(' \n \r\n null \r\n (foo)');
    const res = parseNull(input);
    expect(res).toEqual([PDFNull.instance, typedArrayFor(' \r\n (foo)')]);
  });
});
