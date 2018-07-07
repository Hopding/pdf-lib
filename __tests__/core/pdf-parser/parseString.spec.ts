import { PDFString } from 'core/pdf-objects';
import parseString from 'core/pdf-parser/parseString';
import { typedArrayFor } from 'utils';

describe(`parseString`, () => {
  it(`parses a single PDF String object from its input array`, () => {
    const input = typedArrayFor('(FOOBAR)(AND STUFF)');
    const res = parseString(input);
    expect(res).toEqual([expect.any(PDFString), expect.any(Uint8Array)]);
    expect(res[0].string).toEqual('FOOBAR');
    expect(res[1]).toEqual(typedArrayFor('(AND STUFF)'));
  });

  it(`returns undefined when leading input is not a PDF String`, () => {
    const input = typedArrayFor('<< /Key /Val >>(AND STUFF)');
    const res = parseString(input);
    expect(res).toBeUndefined();
  });

  it(`invokes the "onParseString" parseHandler with the parsed PDFString object`, () => {
    const parseHandlers = {
      onParseString: jest.fn(),
    };
    const input = typedArrayFor('(FOOBAR)');
    parseString(input, parseHandlers);
    expect(parseHandlers.onParseString).toHaveBeenCalledWith(
      expect.any(PDFString),
    );
  });

  it(`allows leading whitespace and line endings before & after the PDF String object`, () => {
    const input = typedArrayFor(' \n \r\n (FOOBAR) \r\n << /Key /Val >>');
    const res = parseString(input);
    expect(res).toEqual([expect.any(PDFString), expect.any(Uint8Array)]);
    expect(res[0].string).toEqual('FOOBAR');
    expect(res[1]).toEqual(typedArrayFor(' \r\n << /Key /Val >>'));
  });

  it(`parses strings with nested parenthesis`, () => {
    const input = typedArrayFor('(FOO(BAR(QUX)(BAZ)))');
    const res = parseString(input);
    expect(res).toEqual([expect.any(PDFString), expect.any(Uint8Array)]);
    expect(res[0].string).toEqual('FOO(BAR(QUX)(BAZ))');
    expect(res[1]).toEqual(typedArrayFor(''));
  });

  it(`returns undefined if the parenthesis in the input aren't balanced`, () => {
    const input1 = typedArrayFor('(FOO(BAR)');
    const res1 = parseString(input1);
    expect(res1).toBeUndefined();

    const input2 = typedArrayFor('FOO)BAR)');
    const res2 = parseString(input2);
    expect(res2).toBeUndefined();
  });

  it(`respects escaped parenthesis`, () => {
    const input = typedArrayFor('(FOO\\(BAR)');
    const res = parseString(input);
    expect(res).toEqual([expect.any(PDFString), expect.any(Uint8Array)]);
    expect(res[0].string).toEqual('FOO\\(BAR');
    expect(res[1]).toEqual(typedArrayFor(''));
  });

  it(`respects escaped backslashes`, () => {
    const input = typedArrayFor('(FOO\\\\(BAR)');
    const res = parseString(input);
    expect(res).toBeUndefined();
  });
});
