import PDFPageLeaf from '../../../src/core/structures/PDFPageLeaf';
import {
  mergeIntoTypedArray,
  PDFArray,
  PDFBool,
  PDFCatalog,
  PDFContext,
  PDFDict,
  PDFHexString,
  PDFName,
  PDFNull,
  PDFNumber,
  PDFObjectParser,
  PDFPageTree,
  PDFRawStream,
  PDFRef,
  PDFString,
  typedArrayFor,
  numberToString,
} from '../../../src/index';

type ParseOptions = { capNumbers?: boolean };

const parse = (value: string | Uint8Array, options: ParseOptions = {}) => {
  const context = PDFContext.create();
  const parser = PDFObjectParser.forBytes(
    typedArrayFor(value),
    context,
    options.capNumbers,
  );
  return parser.parseObject();
};

const expectParse = (value: string | Uint8Array, options?: ParseOptions) =>
  expect(parse(value, options));

const expectParseStr = (value: string | Uint8Array, options?: ParseOptions) =>
  expect(String(parse(value, options)));

describe(`PDFObjectParser`, () => {
  const origConsoleWarn = console.warn;

  beforeAll(() => {
    const ignoredWarnings = [
      'Parsed number that is too large for some PDF readers:',
    ];
    console.warn = jest.fn((...args) => {
      const isIgnored = ignoredWarnings.find((iw) => args[0].includes(iw));
      if (!isIgnored) origConsoleWarn(...args);
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    console.warn = origConsoleWarn;
  });

  it(`throws an error when given empty input`, () => {
    expect(() => parse('')).toThrow();
  });

  it(`throws an error for invalid input`, () => {
    expect(() => parse('I_AM_INVAL')).toThrow();
  });

  describe(`when parsing true booleans`, () => {
    it(`handles just the 'true' keyword`, () => {
      expectParse('true').toBe(PDFBool.True);
    });

    it(`handles whitespace before and after the 'true' keyword`, () => {
      expectParse('\0\t\n\f\r true\0\t\n\f\r ').toBe(PDFBool.True);
    });

    it(`handles comments before and after the 'true' keyword`, () => {
      expectParse('% Lulz wut?\ntrue% Lulz wut?\n').toBe(PDFBool.True);
    });
  });

  describe(`when parsing false booleans`, () => {
    it(`handles just the 'false' keyword`, () => {
      expectParse('false').toBe(PDFBool.False);
    });

    it(`handles whitespace before and after the 'false' keyword`, () => {
      expectParse('\0\t\n\f\r false\0\t\n\f\r ').toBe(PDFBool.False);
    });

    it(`handles comments before and after the 'false' keyword`, () => {
      expectParse('% Lulz wut?\nfalse% Lulz wut?\n').toBe(PDFBool.False);
    });
  });

  describe(`when parsing numbers`, () => {
    [
      ['123', '123'],
      ['43445', '43445'],
      ['+17', '17'],
      ['-98', '-98'],
      ['0', '0'],
      ['34.5', '34.5'],
      ['-3.62', '-3.62'],
      ['+123.6', '123.6'],
      ['4.', '4'],
      ['-.002', '-0.002'],
      ['0.', '0'],
    ].forEach(([input, output]) => {
      it(`handles ${input}`, () => {
        expectParse(input).toBeInstanceOf(PDFNumber);
        expectParseStr(input).toBe(output);
      });
    });

    it(`handles whitespace before and after the number`, () => {
      expectParse('\0\t\n\f\r -.5\0\t\n\f\r ').toBeInstanceOf(PDFNumber);
      expectParseStr('\0\t\n\f\r -.5\0\t\n\f\r ').toBe('-0.5');
    });

    it(`handles comments before and after the number`, () => {
      expectParse('% Lulz wut?\n-.5% Lulz wut?\n').toBeInstanceOf(PDFNumber);
      expectParseStr('% Lulz wut?\n-.5% Lulz wut?\n').toBe('-0.5');
    });

    it(`stops parsing the number when whitespace is encountered`, () => {
      expectParseStr('12\0' + '3').toBe('12');
      expectParseStr('12\t3').toBe('12');
      expectParseStr('12\n3').toBe('12');
      expectParseStr('12\f3').toBe('12');
      expectParseStr('12\r3').toBe('12');
      expectParseStr('12 3').toBe('12');
    });

    it(`stops parsing the number when a delimiter is encountered`, () => {
      expectParseStr('12(3').toBe('12');
      expectParseStr('12)3').toBe('12');
      expectParseStr('12<3').toBe('12');
      expectParseStr('12>3').toBe('12');
      expectParseStr('12[3').toBe('12');
      expectParseStr('12]3').toBe('12');
      expectParseStr('12{3').toBe('12');
      expectParseStr('12}3').toBe('12');
      expectParseStr('12/3').toBe('12');
      expectParseStr('12%3').toBe('12');
    });

    it(`can parse several numbers mashed together`, () => {
      const input = typedArrayFor('0.01.123+2.1-3..1-2.-.1');
      const context = PDFContext.create();
      const parser = PDFObjectParser.forBytes(input, context);
      expect(parser.parseObject().toString()).toBe('0.01');
      expect(parser.parseObject().toString()).toBe('0.123');
      expect(parser.parseObject().toString()).toBe('2.1');
      expect(parser.parseObject().toString()).toBe('-3');
      expect(parser.parseObject().toString()).toBe('0.1');
      expect(parser.parseObject().toString()).toBe('-2');
      expect(parser.parseObject().toString()).toBe('-0.1');
    });

    it(`caps numbers at Number.MAX_SAFE_INTEGER when capNumbers=true`, () => {
      expectParseStr(numberToString(Number.MAX_SAFE_INTEGER - 1), {
        capNumbers: true,
      }).toBe('9007199254740990');
      expectParseStr(numberToString(Number.MAX_SAFE_INTEGER), {
        capNumbers: true,
      }).toBe('9007199254740991');
      expectParseStr(numberToString(Number.MAX_SAFE_INTEGER + 1), {
        capNumbers: true,
      }).toBe('9007199254740991');
      expectParseStr('340282346638528900000000000000000000000', {
        capNumbers: true,
      }).toBe('9007199254740991');
      expectParseStr('340282346638528859811704183484516925440', {
        capNumbers: true,
      }).toBe('9007199254740991');
    });

    it(`does not cap numbers at Number.MAX_SAFE_INTEGER when capNumbers=false`, () => {
      expectParseStr(numberToString(Number.MAX_SAFE_INTEGER - 1)).toBe(
        '9007199254740990',
      );
      expectParseStr(numberToString(Number.MAX_SAFE_INTEGER)).toBe(
        '9007199254740991',
      );
      expectParseStr(numberToString(Number.MAX_SAFE_INTEGER + 1)).toBe(
        '9007199254740992',
      );
      expectParseStr('340282346638528900000000000000000000000').toBe(
        '340282346638528900000000000000000000000',
      );
      expectParseStr('340282346638528859811704183484516925440').toBe(
        '340282346638528900000000000000000000000',
      );
    });
  });

  describe(`when parsing literal strings`, () => {
    [
      ['(This is a string)'],
      ['(Strings may contain newlines\nand such.)'],
      [
        '(Strings may contain balanced parentheses ( ) and special characters (*!&}^% and so on).)',
      ],
      ['(The following is an empty string.)'],
      ['()'],
      ['(It has zero (0) length.)'],
    ].forEach(([input]) => {
      it(`handles ${input}`, () => {
        expectParse(input).toBeInstanceOf(PDFString);
        expectParseStr(input).toBe(input);
      });
    });

    it(`handles whitespace before and after the string`, () => {
      expectParse('\0\t\n\f\r (testing)\0\t\n\f\r ').toBeInstanceOf(PDFString);
      expectParseStr('\0\t\n\f\r (testing)\0\t\n\f\r ').toBe('(testing)');
    });

    it(`handles comments before and after the string`, () => {
      expectParse('% Lulz wut?\n(testing)% Lulz wut?\n').toBeInstanceOf(
        PDFString,
      );
      expectParseStr('% Lulz wut?\n(testing)% Lulz wut?\n').toBe('(testing)');
    });

    it(`does not stop parsing the string when whitespace is encountered`, () => {
      expectParseStr('(foo\0bar)').toBe('(foo\0bar)');
      expectParseStr('(foo\tbar)').toBe('(foo\tbar)');
      expectParseStr('(foo\nbar)').toBe('(foo\nbar)');
      expectParseStr('(foo\fbar)').toBe('(foo\fbar)');
      expectParseStr('(foo\rbar)').toBe('(foo\rbar)');
      expectParseStr('(foo bar)').toBe('(foo bar)');
    });

    it(`does not stop parsing the string when a delimiter is encountered`, () => {
      expectParseStr('(foo<bar)').toBe('(foo<bar)');
      expectParseStr('(foo>bar)').toBe('(foo>bar)');
      expectParseStr('(foo[bar)').toBe('(foo[bar)');
      expectParseStr('(foo]bar)').toBe('(foo]bar)');
      expectParseStr('(foo{bar)').toBe('(foo{bar)');
      expectParseStr('(foo}bar)').toBe('(foo}bar)');
      expectParseStr('(foo/bar)').toBe('(foo/bar)');
      expectParseStr('(foo%bar)').toBe('(foo%bar)');
    });

    it(`handles comments embedded within the string`, () => {
      expectParse('(stuff% and things\n)').toBeInstanceOf(PDFString);
      expectParseStr('(stuff% and things\n)').toBe('(stuff% and things\n)');
    });

    it(`handles nested parenthesis`, () => {
      expectParse('(FOO(BAR(QUX)(BAZ)))').toBeInstanceOf(PDFString);
      expectParseStr('(FOO(BAR(QUX)(BAZ)))').toBe('(FOO(BAR(QUX)(BAZ)))');
    });

    it(`respects escaped parenthesis`, () => {
      expectParse('(FOO\\(BAR)').toBeInstanceOf(PDFString);
      expectParseStr('(FOO\\(BAR)').toBe('(FOO\\(BAR)');
    });

    it(`respects escaped backslashes`, () => {
      expect(() => parse('(FOO\\\\(BAR)')).toThrow();
    });
  });

  describe(`when parsing hex strings`, () => {
    [
      ['<4E6F762073686D6F7A206B6120706F702E>'],
      ['<901FA3>'],
      ['<901FA>'],
      ['<01\n23\r45\f67\t89\0ab cdefABCDEF>'],
    ].forEach(([input]) => {
      it(`handles ${input}`, () => {
        expectParse(input).toBeInstanceOf(PDFHexString);
        expectParseStr(input).toBe(input);
      });
    });

    it(`handles whitespace before and after the hex string`, () => {
      expectParse('\0\t\n\f\r <ABC123>\0\t\n\f\r ').toBeInstanceOf(
        PDFHexString,
      );
      expectParseStr('\0\t\n\f\r <ABC123>\0\t\n\f\r ').toBe('<ABC123>');
    });

    it(`handles comments before and after the hex string`, () => {
      expectParse('% Lulz wut?\n<ABC123>% Lulz wut?\n').toBeInstanceOf(
        PDFHexString,
      );
      expectParseStr('% Lulz wut?\n<ABC123>% Lulz wut?\n').toBe('<ABC123>');
    });

    it(`does not stop parsing the hex string when whitespace is encountered`, () => {
      expectParseStr('<ABC\0D>').toBe('<ABC\0D>');
      expectParseStr('<ABC\tD>').toBe('<ABC\tD>');
      expectParseStr('<ABC\nD>').toBe('<ABC\nD>');
      expectParseStr('<ABC\fD>').toBe('<ABC\fD>');
      expectParseStr('<ABC\rD>').toBe('<ABC\rD>');
      expectParseStr('<ABC D>').toBe('<ABC D>');
    });
  });

  describe(`when parsing names`, () => {
    [
      ['/Name1', 'Name1'],
      ['/ASomewhatLongerName', 'ASomewhatLongerName'],
      [
        '/A;Name_With-Various***Characters?',
        'A;Name_With-Various***Characters?',
      ],
      ['/1.2', '1.2'],
      ['/$$', '$$'],
      ['/@pattern', '@pattern'],
      ['/.notdef', '.notdef'],
      ['/lime#20Green', 'lime Green'],
      ['/paired#28#29parentheses', 'paired()parentheses'],
      ['/The_Key_of_F#23_Minor', 'The_Key_of_F#_Minor'],
      ['/A#42', 'AB'],
    ].forEach(([input, output]) => {
      it(`handles ${input}`, () => {
        expectParse(input).toBe(PDFName.of(output));
      });
    });

    it(`handles names consisting of a single '/'`, () => {
      expectParse('/').toBe(PDFName.of(''));
    });

    it(`handles whitespace before and after the name`, () => {
      expectParse('\0\t\n\f\r /Foo\0\t\n\f\r ').toBe(PDFName.of('Foo'));
    });

    it(`handles comments before and after the name`, () => {
      expectParse('% Lulz wut?\n/Foo% Lulz wut?\n').toBe(PDFName.of('Foo'));
    });

    it(`stops parsing the name when whitespace is encountered`, () => {
      expectParse('/Foo\0Bar').toBe(PDFName.of('Foo'));
      expectParse('/Foo\tBar').toBe(PDFName.of('Foo'));
      expectParse('/Foo\nBar').toBe(PDFName.of('Foo'));
      expectParse('/Foo\fBar').toBe(PDFName.of('Foo'));
      expectParse('/Foo\rBar').toBe(PDFName.of('Foo'));
      expectParse('/Foo Bar').toBe(PDFName.of('Foo'));
    });

    it(`stops parsing the name when a delimiter is encountered`, () => {
      expectParse('/Foo(Bar').toBe(PDFName.of('Foo'));
      expectParse('/Foo)Bar').toBe(PDFName.of('Foo'));
      expectParse('/Foo<Bar').toBe(PDFName.of('Foo'));
      expectParse('/Foo>Bar').toBe(PDFName.of('Foo'));
      expectParse('/Foo[Bar').toBe(PDFName.of('Foo'));
      expectParse('/Foo]Bar').toBe(PDFName.of('Foo'));
      expectParse('/Foo{Bar').toBe(PDFName.of('Foo'));
      expectParse('/Foo}Bar').toBe(PDFName.of('Foo'));
      expectParse('/Foo/Bar').toBe(PDFName.of('Foo'));
      expectParse('/Foo%Bar').toBe(PDFName.of('Foo'));
    });

    it(`can parse several names mashed together`, () => {
      const input = typedArrayFor('/Foo/Bar/Qux//Baz/Bing/Bang');
      const context = PDFContext.create();
      const parser = PDFObjectParser.forBytes(input, context);
      expect(parser.parseObject()).toBe(PDFName.of('Foo'));
      expect(parser.parseObject()).toBe(PDFName.of('Bar'));
      expect(parser.parseObject()).toBe(PDFName.of('Qux'));
      expect(parser.parseObject()).toBe(PDFName.of(''));
      expect(parser.parseObject()).toBe(PDFName.of('Baz'));
      expect(parser.parseObject()).toBe(PDFName.of('Bing'));
      expect(parser.parseObject()).toBe(PDFName.of('Bang'));
    });

    it(`handles names containing non-ASCII characters`, () => {
      expectParse('/ABCDEE+»ªÎÄÖÐËÎ').toBe(PDFName.of('ABCDEE+»ªÎÄÖÐËÎ'));
    });
  });

  describe(`when parsing arrays`, () => {
    it(`handles empty arrays`, () => {
      expectParse('[]').toBeInstanceOf(PDFArray);
      expectParseStr('[]').toBe('[ ]');
    });

    it(`handles empty arrays with whitespace between braces`, () => {
      expectParse('[\0\t\n\f\r ]').toBeInstanceOf(PDFArray);
      expectParseStr('[\0\t\n\f\r ]').toBe('[ ]');
    });

    it(`handles arrays of all value types seperated by whitespace and (multiple) comments`, () => {
      const input = `% Comment
        \0\t\n\f\r % Comment
        [
        \0\t\n\f\r % Comment
        /Foo % Comment
        \0\t\n\f\r % Comment
        << /Key /Val >> % Comment
        \0\t\n\f\r % Comment
        [] % Comment
        \0\t\n\f\r % Comment
        (Bar) % Comment
        \0\t\n\f\r % Comment
        21 0 R % Comment
        \0\t\n\f\r % Comment
        0.56 % Comment
        \0\t\n\f\r % Comment
        <ABC123> % Comment
        \0\t\n\f\r % Comment
        true % Comment
        \0\t\n\f\r % Comment
        null % Comment
        \0\t\n\f\r % Comment
      ]% Comment
      \0\t\n\f\r % Comment`;
      const object = parse(input);
      expect(object).toBeInstanceOf(PDFArray);

      const array = object as PDFArray;
      expect(array.size()).toBe(9);
      expect(array.get(0)).toBe(PDFName.of('Foo'));
      expect(array.get(1)).toBeInstanceOf(PDFDict);
      expect(array.get(2)).toBeInstanceOf(PDFArray);
      expect(array.get(3)).toBeInstanceOf(PDFString);
      expect(array.get(4)).toBe(PDFRef.of(21));
      expect(array.get(5)).toBeInstanceOf(PDFNumber);
      expect(array.get(6)).toBeInstanceOf(PDFHexString);
      expect(array.get(7)).toBe(PDFBool.True);
      expect(array.get(8)).toBe(PDFNull);
    });

    it(`handles arrays with no whitespace or comments`, () => {
      expectParse('[true/FooBar[]<</Foo/Bar>>21.null]').toBeInstanceOf(
        PDFArray,
      );
      expectParseStr('[true/FooBar[]<</Foo/Bar>>21.null]').toBe(
        '[ true /FooBar [ ] <<\n/Foo /Bar\n>> 21 null ]',
      );
    });

    it(`throws an error when closing delimiter is missing`, () => {
      expect(() => parse('[/Foo')).toThrow();
    });

    it(`throws an error for mismatches delimiters`, () => {
      expect(() => parse('[[]')).toThrow();
    });

    it(`throws an error when an invalid element is detected`, () => {
      expect(() => parse('[/Foo I_AM_INVALID]')).toThrow();
    });
  });

  describe(`when parsing dictionaries`, () => {
    it(`handles empty dictionaries`, () => {
      expectParse('<<>>').toBeInstanceOf(PDFDict);
      expectParseStr('<<>>').toBe('<<\n>>');
    });

    it(`handles empty dictionaries with whitespace between brackets`, () => {
      expectParse('<<\0\t\n\f\r >>').toBeInstanceOf(PDFDict);
      expectParseStr('<<\0\t\n\f\r >>').toBe('<<\n>>');
    });

    it(`handles dictionaries of all value types seperated by whitespace and (multiplecomments`, () => {
      const input = `% Comment
      \0\t\n\f\r % Comment
      <<
          % Entry 1
          /PDFName % Key
          /Foo     % Value

          % Entry 2
          /PDFDictionary  % Key
          << /Key /Val >> % Value

          % Entry 3
          /PDFArray % Key
          [1 (2)]   % Value

          % Entry 4
          /PDFString        % Key
          (Look, a string!) % Value

          % Entry 5
          /PDFRef % Key
          21 0 R  % Value

          % Entry 6
          /PDFNumber % Key
          -.123      % Value

          % Entry 7
          /PDFHexString % Key
          <ABC123>      % Value

          % Entry 8
          /PDFBool % Key
          true     % Value

          % Entry 9
          /PDFNull % Key
          null     % Value

          % End
        >>% Comment
        \0\t\n\f\r % Comment
      `;
      const object = parse(input);
      expect(object).toBeInstanceOf(PDFDict);

      const dict = object as PDFDict;
      expect(dict.entries().length).toBe(9);
      expect(dict.get(PDFName.of('PDFName'))).toBe(PDFName.of('Foo'));
      expect(dict.get(PDFName.of('PDFDictionary'))).toBeInstanceOf(PDFDict);
      expect(dict.get(PDFName.of('PDFArray'))).toBeInstanceOf(PDFArray);
      expect(dict.get(PDFName.of('PDFString'))).toBeInstanceOf(PDFString);
      expect(dict.get(PDFName.of('PDFRef'))).toBe(PDFRef.of(21));
      expect(dict.get(PDFName.of('PDFNumber'))).toBeInstanceOf(PDFNumber);
      expect(dict.get(PDFName.of('PDFHexString'))).toBeInstanceOf(PDFHexString);
      expect(dict.get(PDFName.of('PDFBool'))).toBe(PDFBool.True);
      expect(dict.get(PDFName.of('PDFNull'))).toBe(undefined);
    });

    it(`handles dictionaries with no whitespace or comments`, () => {
      expectParse(
        '<</Foo true/Bar[]/Qux<<>>/Baz 21./Bing null>>',
      ).toBeInstanceOf(PDFDict);
      expectParseStr('<</Foo true/Bar[]/Qux<<>>/Baz 21./Bing null>>').toBe(
        '<<\n/Foo true\n/Bar [ ]\n/Qux <<\n>>\n/Baz 21\n/Bing null\n>>',
      );
    });

    it(`returns the correct subclass based on the dictionary's 'Type'`, () => {
      expectParse('<< >>').toBeInstanceOf(PDFDict);
      expectParse('<< /Type /Catalog >>').toBeInstanceOf(PDFCatalog);
      expectParse('<< /Type /Pages >>').toBeInstanceOf(PDFPageTree);
      expectParse('<< /Type /Page >>').toBeInstanceOf(PDFPageLeaf);
    });

    it(`throws an error when closing delimiter is missing`, () => {
      expect(() => parse('<</Foo/Bar')).toThrow();
    });

    it(`throws an error for mismatched delimiters`, () => {
      expect(() => parse('<<>')).toThrow();
    });

    it(`throws an error when an invalid key is detected`, () => {
      expect(() => parse('<</Foo/Bar I_AM_INVALID>>')).toThrow();
    });

    it(`throws an error when an invalid value is detected`, () => {
      expect(() => parse('<</Foo I_AM_INVALID>>')).toThrow();
    });
  });

  describe(`when parsing streams`, () => {
    [
      [
        '<< >>\nstream\nstream foobar endstream\nendstream',
        '<<\n/Length 23\n>>\nstream\nstream foobar endstream\nendstream',
      ],
      [
        '<</Length 2>>\r\nstream\r\nquxbaz\r\nendstream',
        '<<\n/Length 6\n>>\nstream\nquxbaz\nendstream',
      ],
      [
        '<<>>streamfoobarendstream',
        '<<\n/Length 6\n>>\nstream\nfoobar\nendstream',
      ],
      [
        '<<>>\rstream\rstuff\rendstream',
        '<<\n/Length 5\n>>\nstream\nstuff\nendstream',
      ],
      [
        '<<>>\n\rstream\n\rthingz\n\rendstream',
        '<<\n/Length 8\n>>\nstream\n\rthingz\n\nendstream',
      ],
    ].forEach(([input, output]) => {
      it(`can parse ${JSON.stringify(input)}`, () => {
        const object = parse(typedArrayFor(input));
        expect(object).toBeInstanceOf(PDFRawStream);

        const buffer = new Uint8Array(object.sizeInBytes());
        object.copyBytesInto(buffer, 0);
        expect(buffer).toEqual(typedArrayFor(output));
      });
    });

    // Note that the ' \r\n' sequence following the 'stream' keyword is
    // technically invalid (per the specification). But some PDFs have it, so
    // we will support it anyways.
    it(`handles streams with a space, carriage return, and a newline following the 'stream' keyword`, () => {
      expectParse(`<<>>\r\nstream \r\n Stuff and Things \nendstream`);
      expectParseStr(`<<>>\r\nstream \r\n Stuff and Things \nendstream`).toBe(
        '<<\n/Length 18\n>>\nstream\n Stuff and Things \nendstream',
      );
    });

    it(`handles streams with a carriage return and a newline following the 'stream' keyword`, () => {
      expectParse(`<<>>\r\nstream\r\n Stuff and Things \nendstream`);
      expectParseStr(`<<>>\r\nstream\r\n Stuff and Things \nendstream`).toBe(
        '<<\n/Length 18\n>>\nstream\n Stuff and Things \nendstream',
      );
    });

    it(`handles streams with only a carriage return following the 'stream' keyword`, () => {
      expectParse(`<<>>\rstream\r Stuff and Things \nendstream`);
      expectParseStr(`<<>>\nstream\n Stuff and Things \nendstream`).toBe(
        '<<\n/Length 18\n>>\nstream\n Stuff and Things \nendstream',
      );
    });

    it(`handles streams with a carriage return preceding the 'endstream' keyword`, () => {
      expectParse(`<<>>\r\nstream\r\n Stuff and Things \rendstream`);
      expectParseStr(`<<>>\r\nstream\r\n Stuff and Things \rendstream`).toBe(
        '<<\n/Length 18\n>>\nstream\n Stuff and Things \nendstream',
      );
    });

    it(`handles comments and whitespace preceding the 'stream' keyword`, () => {
      expectParse(
        `<<>>\0\t\n\f\r % I am a comment\0\t\n\f\r stream\r\n Stuff and Things \nendstream`,
      );
      expectParseStr(
        `<<>>\0\t\n\f\r % I am a comment\0\t\n\f\r stream\r\n Stuff and Things \nendstream`,
      ).toBe('<<\n/Length 18\n>>\nstream\n Stuff and Things \nendstream');
    });

    it(`handles binary stream content`, () => {
      const input = mergeIntoTypedArray(
        '<<>>stream',
        new Uint8Array([12, 492, 0, 129]),
        'endstream',
      );
      const output = mergeIntoTypedArray(
        '<<\n/Length 4\n>>\nstream\n',
        new Uint8Array([12, 492, 0, 129]),
        '\nendstream',
      );

      const object = parse(typedArrayFor(input));
      expect(object).toBeInstanceOf(PDFRawStream);

      const buffer = new Uint8Array(object.sizeInBytes());
      object.copyBytesInto(buffer, 0);
      expect(buffer).toEqual(typedArrayFor(output));
    });
  });

  describe(`when parsing null`, () => {
    it(`handles just the 'null' keyword`, () => {
      expectParse('null').toBe(PDFNull);
    });

    it(`handles whitespace before and after the 'null' keyword`, () => {
      expectParse('\0\t\n\f\r null\0\t\n\f\r ').toBe(PDFNull);
    });

    it(`handles comments before and after the 'null' keyword`, () => {
      expectParse('% Lulz wut?\nnull% Lulz wut?\n').toBe(PDFNull);
    });
  });

  describe(`when parsing indirect object references`, () => {
    it(`handles whitespace before and after the ref`, () => {
      expectParse('\0\t\n\f\r 1 2 R\0\t\n\f\r ').toBe(PDFRef.of(1, 2));
    });

    it(`handles whitespace within the ref`, () => {
      expectParse('1\0\t\n\f\r2\0\t\n\f\rR').toBe(PDFRef.of(1, 2));
    });

    it(`handles comments before and after the ref`, () => {
      expectParse('% Lulz wut?\n1 2 R% Lulz wut?\n').toBe(PDFRef.of(1, 2));
    });

    it(`handles comments within the ref`, () => {
      expectParse('1% Lulz wut?\r2% Lulz wut?\rR').toBe(PDFRef.of(1, 2));
    });

    it(`does not stop parsing the ref when whitespace is encountered`, () => {
      expectParse('1\0' + '2\0R').toBe(PDFRef.of(1, 2));
      expectParse('1\t2\tR').toBe(PDFRef.of(1, 2));
      expectParse('1\n2\nR').toBe(PDFRef.of(1, 2));
      expectParse('1\f2\fR').toBe(PDFRef.of(1, 2));
      expectParse('1\r2\rR').toBe(PDFRef.of(1, 2));
      expectParse('1 2 R').toBe(PDFRef.of(1, 2));
    });

    it(`stops parsing the ref when a delimiter is encountered`, () => {
      expectParseStr('1 2(R').toBe('1');
      expectParseStr('1 2)R').toBe('1');
      expectParseStr('1 2<R').toBe('1');
      expectParseStr('1 2>R').toBe('1');
      expectParseStr('1 2[R').toBe('1');
      expectParseStr('1 2]R').toBe('1');
      expectParseStr('1 2{R').toBe('1');
      expectParseStr('1 2}R').toBe('1');
      expectParseStr('1 2/R').toBe('1');
      expectParseStr('1 2%R').toBe('1');
    });

    it(`can parse several refs mashed together`, () => {
      const input = typedArrayFor('0 0R1 1R 2 2R');
      const context = PDFContext.create();
      const parser = PDFObjectParser.forBytes(input, context);
      expect(parser.parseObject()).toBe(PDFRef.of(0, 0));
      expect(parser.parseObject()).toBe(PDFRef.of(1, 1));
      expect(parser.parseObject()).toBe(PDFRef.of(2, 2));
    });

    it(`can parse a number, then a ref, then a number`, () => {
      const input = typedArrayFor('0 21 0 R 42');
      const context = PDFContext.create();
      const parser = PDFObjectParser.forBytes(input, context);

      const object1 = parser.parseObject();
      expect(object1).toBeInstanceOf(PDFNumber);
      expect(object1.toString()).toBe('0');

      const object2 = parser.parseObject();
      expect(object2).toBe(PDFRef.of(21));

      const object3 = parser.parseObject();
      expect(object3).toBeInstanceOf(PDFNumber);
      expect(object3.toString()).toBe('42');
    });
  });
});
