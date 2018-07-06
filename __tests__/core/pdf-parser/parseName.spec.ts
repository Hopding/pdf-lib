import { PDFName } from 'core/pdf-objects';
import parseName from 'core/pdf-parser/parseName';
import { typedArrayFor } from 'utils';

describe(`parseName`, () => {
  it(`parses a single PDF Name object from its input array`, () => {
    const input = typedArrayFor('/Foo/Bar');
    const res = parseName(input);
    expect(res).toEqual([PDFName.from('Foo'), typedArrayFor('/Bar')]);
  });

  it(`returns undefined when the leading input is not a PDF Name`, () => {
    const input = typedArrayFor('(Foo)/Bar');
    const res = parseName(input);
    expect(res).toBeUndefined();
  });

  it(`invokes the "onParseName" parseHandler with the parsed PDFName object`, () => {
    const parseHandlers = {
      onParseName: jest.fn(),
    };
    const input = typedArrayFor('/Foo');
    parseName(input, parseHandlers);
    expect(parseHandlers.onParseName).toHaveBeenCalledWith(PDFName.from('Foo'));
  });

  it(`allows leading whitespace and line endings before & after the PDF Name object`, () => {
    const input = typedArrayFor(' \n \r\n /FOOBAR \r\n << /Key /Val >>');
    const res = parseName(input);
    expect(res).toEqual([
      PDFName.from('FOOBAR'),
      typedArrayFor(' \r\n << /Key /Val >>'),
    ]);
  });

  const terminationChars = [' ', '\n', '\r', ']', '[', '<', '>', '(', '/'];
  it(`terminates PDF Name objects on these characters: ${JSON.stringify(
    terminationChars,
  )}`, () => {
    terminationChars.forEach((tc) => {
      const input = typedArrayFor(`/Foo${tc}Bar`);
      const res = parseName(input);
      expect(res).toEqual([PDFName.from('Foo'), typedArrayFor(`${tc}Bar`)]);
    });
  });

  it(`can parse names consisting of a single forward slash`, () => {
    const input = typedArrayFor('/ /AS /Off');
    const res = parseName(input);
    expect(res[0]).toEqual(PDFName.from(''));
  });
});
