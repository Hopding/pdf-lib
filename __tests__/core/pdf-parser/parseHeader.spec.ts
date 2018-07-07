// Required to prevent an issue with circular dependency resolution in this test
import 'core/pdf-objects';

import parseHeader from 'core/pdf-parser/parseHeader';
import { PDFHeader } from 'core/pdf-structures';
import { typedArrayFor } from 'utils';

describe(`parseHeader`, () => {
  it(`parses a single PDF Header object from its input array`, () => {
    const input = typedArrayFor('%PDF-1.3 %PDF-1.3');
    const res = parseHeader(input);
    expect(res).toEqual([expect.any(PDFHeader), expect.any(Uint8Array)]);

    expect(res[0].major).toEqual(1);
    expect(res[0].minor).toEqual(3);
    expect(res[1]).toEqual(typedArrayFor('%PDF-1.3'));
  });

  it(`returns undefined when leading input is not a PDF Header`, () => {
    const input = typedArrayFor('(%PDF-1.3)');
    const res = parseHeader(input);
    expect(res).toBeUndefined();
  });

  it(`invokes the "onParseHeader" parseHandler with the parsed PDFHeader object`, () => {
    const parseHandlers = {
      onParseHeader: jest.fn(),
    };
    const input = typedArrayFor('%PDF-1.7');
    parseHeader(input, parseHandlers);
    expect(parseHandlers.onParseHeader).toHaveBeenCalledWith(
      expect.any(PDFHeader),
    );
  });

  it(`allows leading whitespace and line endings before & after the PDF Header object`, () => {
    const input = typedArrayFor(' \n \r\n %PDF-1.7 \r\n << /Key /Val >>');
    const res = parseHeader(input);
    expect(res).toEqual([expect.any(PDFHeader), expect.any(Uint8Array)]);
    expect(res[0].major).toEqual(1);
    expect(res[0].minor).toEqual(7);
    expect(res[1]).toEqual(typedArrayFor('<< /Key /Val >>'));
  });
});
