import {
  PDFArray,
  PDFBool,
  PDFHexString,
  PDFName,
  PDFNull,
  PDFNumber,
  PDFParser,
  PDFRef,
  PDFString,
  typedArrayFor,
} from 'src/index';

// TODO: Make sure error is throw when goes past EOF
// TODO: Guard against infinite loops. Test missing closing delimiters...
describe(`PDFParser`, () => {
  it(`can parse true boolean values`, () => {
    const input = typedArrayFor('true');
    const parser = PDFParser.forBytes(input);
    const object = parser.parseObject();
    expect(object).toBe(PDFBool.True);
  });

  it(`can parse false boolean values`, () => {
    const input = typedArrayFor('false');
    const parser = PDFParser.forBytes(input);
    const object = parser.parseObject();
    expect(object).toBe(PDFBool.False);
  });

  it(`can parse null values`, () => {
    const input = typedArrayFor('null');
    const parser = PDFParser.forBytes(input);
    const object = parser.parseObject();
    expect(object).toBe(PDFNull);
  });

  it(`can parse true boolean values`, () => {
    const input = typedArrayFor('true');
    const parser = PDFParser.forBytes(input);
    const object = parser.parseObject();
    expect(object).toBe(PDFBool.True);
  });

  it(`can parse name values`, () => {
    const input = typedArrayFor('/Foo#23Bar!');
    const parser = PDFParser.forBytes(input);
    const object = parser.parseObject();
    expect(object).toBeInstanceOf(PDFName);
    expect(object).toBe(PDFName.of('Foo#Bar!'));
  });

  it(`can parse empty arrays`, () => {
    const input = typedArrayFor('[]');
    const parser = PDFParser.forBytes(input);
    const object = parser.parseObject();
    expect(object).toBeInstanceOf(PDFArray);
    expect(object.toString()).toBe('[ ]');
  });

  it(`can parse non-empty arrays`, () => {
    const input = typedArrayFor('[  true   /FooBar false ]');
    const parser = PDFParser.forBytes(input);
    const object = parser.parseObject();
    expect(object).toBeInstanceOf(PDFArray);
    expect(object.toString()).toBe('[ true /FooBar false ]');
  });

  it(`can parse refs`, () => {
    const input = typedArrayFor('0 1 R');
    const parser = PDFParser.forBytes(input);
    const object = parser.parseObject();
    expect(object).toBe(PDFRef.of(0, 1));
  });

  it(`can parse a number, then a ref, then a number`, () => {
    const input = typedArrayFor('0 21 0 R 42');
    const parser = PDFParser.forBytes(input);

    const object1 = parser.parseObject();
    expect(object1).toBeInstanceOf(PDFNumber);
    expect(object1.toString()).toBe('0');

    const object2 = parser.parseObject();
    expect(object2).toBe(PDFRef.of(21));

    const object3 = parser.parseObject();
    expect(object3).toBeInstanceOf(PDFNumber);
    expect(object3.toString()).toBe('42');
  });

  describe(`parsing numbers`, () => {
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
      it(`can parse ${input}`, () => {
        const parser = PDFParser.forBytes(typedArrayFor(input));
        const object = parser.parseObject();
        expect(object).toBeInstanceOf(PDFNumber);
        expect(object.toString()).toBe(output);
      });
    });

    it(`can parse numbers mashed together`, () => {
      const input = typedArrayFor('0.01.123+2.1-3..1-2.-.1');
      const parser = PDFParser.forBytes(input);
      expect(parser.parseObject().toString()).toBe('0.01');
      expect(parser.parseObject().toString()).toBe('0.123');
      expect(parser.parseObject().toString()).toBe('2.1');
      expect(parser.parseObject().toString()).toBe('-3');
      expect(parser.parseObject().toString()).toBe('0.1');
      expect(parser.parseObject().toString()).toBe('-2');
      expect(parser.parseObject().toString()).toBe('-0.1');
    });
  });

  it(`can parse hex strings`, () => {
    const parser = PDFParser.forBytes(
      typedArrayFor('<01\n23\r45\f67\t89\0ab cdefABCDEF>'),
    );
    const object = parser.parseObject();
    expect(object).toBeInstanceOf(PDFHexString);
    expect(object.toString()).toBe('<01\n23\r45\f67\t89\0ab cdefABCDEF>');
  });

  it(`can parse literal strings`, () => {
    const parser = PDFParser.forBytes(typedArrayFor('(testing)'));
    const object = parser.parseObject();
    expect(object).toBeInstanceOf(PDFString);
    expect(object.toString()).toBe('(testing)');
  });

  it(`can parse literal strings with nested parenthesis`, () => {
    const parser = PDFParser.forBytes(typedArrayFor('(FOO(BAR(QUX)(BAZ)))'));
    const object = parser.parseObject();
    expect(object).toBeInstanceOf(PDFString);
    expect(object.toString()).toBe('(FOO(BAR(QUX)(BAZ)))');
  });

  it(`respects escaped parenthesis`, () => {
    const parser = PDFParser.forBytes(typedArrayFor('(FOO\\(BAR)'));
    const object = parser.parseObject();
    expect(object).toBeInstanceOf(PDFString);
    expect(object.toString()).toBe('(FOO\\(BAR)');
  });

  it(`respects escaped backslashes`, () => {
    const parser = PDFParser.forBytes(typedArrayFor('(FOO\\\\(BAR)'));
    expect(() => parser.parseObject()).toThrow();
  });
});
