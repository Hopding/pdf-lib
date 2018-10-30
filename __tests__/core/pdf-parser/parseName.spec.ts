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
    const input = typedArrayFor(' \0\f \t\n \r\n /FOOBAR \r\n << /Key /Val >>');
    const res = parseName(input);
    expect(res).toEqual([
      PDFName.from('FOOBAR'),
      typedArrayFor(' \r\n << /Key /Val >>'),
    ]);
  });

  const terminationChars = [
    '\0',
    '\t',
    '\n',
    '\f',
    '\r',
    ' ',
    ']',
    '[',
    '<',
    '>',
    '(',
    '/',
  ];
  terminationChars.forEach((tc) => {
    it(`terminates PDF Name objects on ${JSON.stringify(tc)}`, () => {
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

  describe('documentation examples, 7.3.5 Table 4', () => {
    const examples = [
      { raw: '/Name1', name: 'Name1' },
      { raw: '/ASomewhatLongerName', name: 'ASomewhatLongerName' },
      {
        raw: '/A;Name_With-Various***Characters?',
        name: 'A;Name_With-Various***Characters?',
      },
      { raw: '/1.2', name: '1.2' },
      { raw: '/$$', name: '$$' },
      { raw: '/@pattern', name: '@pattern' },
      { raw: '/.notdef', name: '.notdef' },
      { raw: '/Lime#20Green', name: 'Lime Green' },
      { raw: '/paired#28#29parentheses', name: 'paired()parentheses' },
      { raw: '/The_Key_of_F#23_Minor', name: 'The_Key_of_F#_Minor' },
      { raw: '/A#42', name: 'AB' },
    ];

    examples.forEach((example) => {
      it(`will parse ${example.raw} as ${example.name}`, () => {
        const input = typedArrayFor(example.raw);
        const res = parseName(input);
        expect(res[0]).toEqual(PDFName.from(example.name));
      });
    });
  });
});
