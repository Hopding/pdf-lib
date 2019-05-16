import {
  PDFArray,
  PDFBool,
  PDFContext,
  PDFDict,
  PDFHexString,
  PDFName,
  PDFNull,
  PDFNumber,
  PDFObjectParser,
  PDFRawStream,
  PDFRef,
  PDFString,
  typedArrayFor,
} from 'src/index';

// TODO: Make sure error is throw when goes past EOF
// TODO: Guard against infinite loops. Test missing closing delimiters...
describe(`PDFObjectParser`, () => {
  it(`can parse true boolean values`, () => {
    const input = typedArrayFor('true');
    const context = PDFContext.create();
    const parser = PDFObjectParser.forBytes(input, context);
    const object = parser.parseObject();
    expect(object).toBe(PDFBool.True);
  });

  it(`can parse false boolean values`, () => {
    const input = typedArrayFor('false');
    const context = PDFContext.create();
    const parser = PDFObjectParser.forBytes(input, context);
    const object = parser.parseObject();
    expect(object).toBe(PDFBool.False);
  });

  it(`can parse null values`, () => {
    const input = typedArrayFor('null');
    const context = PDFContext.create();
    const parser = PDFObjectParser.forBytes(input, context);
    const object = parser.parseObject();
    expect(object).toBe(PDFNull);
  });

  it(`can parse true boolean values`, () => {
    const input = typedArrayFor('true');
    const context = PDFContext.create();
    const parser = PDFObjectParser.forBytes(input, context);
    const object = parser.parseObject();
    expect(object).toBe(PDFBool.True);
  });

  it(`can parse name values`, () => {
    const input = typedArrayFor('/Foo#23Bar!');
    const context = PDFContext.create();
    const parser = PDFObjectParser.forBytes(input, context);
    const object = parser.parseObject();
    expect(object).toBeInstanceOf(PDFName);
    expect(object).toBe(PDFName.of('Foo#Bar!'));
  });

  it(`can parse empty name values`, () => {
    const input = typedArrayFor(`/ `);
    const context = PDFContext.create();
    const parser = PDFObjectParser.forBytes(input, context);
    const object = parser.parseObject();
    expect(object).toBe(PDFName.of(''));
  });

  ['\0', '\t', '\n', '\f', '\r', ' ', ']', '[', '<', '>', '(', '/'].forEach(
    (nameTerminator) => {
      it(`terminates PDF Names on ${JSON.stringify(nameTerminator)}`, () => {
        const input = typedArrayFor(`/Foo${nameTerminator}Bar`);
        const context = PDFContext.create();
        const parser = PDFObjectParser.forBytes(input, context);
        const object = parser.parseObject();
        expect(object).toBe(PDFName.of(`Foo`));
      });
    },
  );

  it(`can parse empty arrays`, () => {
    const input = typedArrayFor('[]');
    const context = PDFContext.create();
    const parser = PDFObjectParser.forBytes(input, context);
    const object = parser.parseObject();
    expect(object).toBeInstanceOf(PDFArray);
    expect(object.toString()).toBe('[ ]');
  });

  it(`can parse non-empty arrays`, () => {
    const input = typedArrayFor('[  true   /FooBar false ]');
    const context = PDFContext.create();
    const parser = PDFObjectParser.forBytes(input, context);
    const object = parser.parseObject();
    expect(object).toBeInstanceOf(PDFArray);
    expect(object.toString()).toBe('[ true /FooBar false ]');
  });

  it(`can parse empty dictionaries`, () => {
    const input = typedArrayFor('<<>>');
    const context = PDFContext.create();
    const parser = PDFObjectParser.forBytes(input, context);
    const object = parser.parseObject();
    expect(object).toBeInstanceOf(PDFDict);
    expect(object.toString()).toBe('<<\n>>');
  });

  it(`can parse non-empty dictionaries`, () => {
    const input = typedArrayFor(
      '<</Foo/Bar /Qux <<>> /Another <<  /Test []  >>>>',
    );
    const context = PDFContext.create();
    const parser = PDFObjectParser.forBytes(input, context);
    const object = parser.parseObject();
    expect(object).toBeInstanceOf(PDFDict);
    expect(object.toString()).toBe(
      '<<\n/Foo /Bar\n/Qux <<\n>>\n/Another <<\n/Test [ ]\n>>\n>>',
    );
  });

  it(`can parse streams`, () => {
    const input = typedArrayFor(
      '<< >>stream\nstream foobar endstream\nendstream',
    );
    const context = PDFContext.create();
    const parser = PDFObjectParser.forBytes(input, context);
    const object = parser.parseObject();
    expect(object).toBeInstanceOf(PDFRawStream);

    const buffer = new Uint8Array(object.sizeInBytes());
    object.copyBytesInto(buffer, 0);
    expect(buffer).toEqual(
      typedArrayFor(
        '<<\n/Length 23\n>>\nstream\nstream foobar endstream\nendstream',
      ),
    );
  });

  it(`can parse refs`, () => {
    const input = typedArrayFor('0 1 R');
    const context = PDFContext.create();
    const parser = PDFObjectParser.forBytes(input, context);
    const object = parser.parseObject();
    expect(object).toBe(PDFRef.of(0, 1));
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
        const context = PDFContext.create();
        const parser = PDFObjectParser.forBytes(typedArrayFor(input), context);
        const object = parser.parseObject();
        expect(object).toBeInstanceOf(PDFNumber);
        expect(object.toString()).toBe(output);
      });
    });

    it(`can parse numbers mashed together`, () => {
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
  });

  it(`can parse hex strings`, () => {
    const context = PDFContext.create();
    const parser = PDFObjectParser.forBytes(
      typedArrayFor('<01\n23\r45\f67\t89\0ab cdefABCDEF>'),
      context,
    );
    const object = parser.parseObject();
    expect(object).toBeInstanceOf(PDFHexString);
    expect(object.toString()).toBe('<01\n23\r45\f67\t89\0ab cdefABCDEF>');
  });

  it(`can parse literal strings`, () => {
    const context = PDFContext.create();
    const parser = PDFObjectParser.forBytes(
      typedArrayFor('(testing)'),
      context,
    );
    const object = parser.parseObject();
    expect(object).toBeInstanceOf(PDFString);
    expect(object.toString()).toBe('(testing)');
  });

  it(`can parse literal strings with nested parenthesis`, () => {
    const context = PDFContext.create();
    const parser = PDFObjectParser.forBytes(
      typedArrayFor('(FOO(BAR(QUX)(BAZ)))'),
      context,
    );
    const object = parser.parseObject();
    expect(object).toBeInstanceOf(PDFString);
    expect(object.toString()).toBe('(FOO(BAR(QUX)(BAZ)))');
  });

  it(`respects escaped parenthesis`, () => {
    const context = PDFContext.create();
    const parser = PDFObjectParser.forBytes(
      typedArrayFor('(FOO\\(BAR)'),
      context,
    );
    const object = parser.parseObject();
    expect(object).toBeInstanceOf(PDFString);
    expect(object.toString()).toBe('(FOO\\(BAR)');
  });

  it(`respects escaped backslashes`, () => {
    const context = PDFContext.create();
    const parser = PDFObjectParser.forBytes(
      typedArrayFor('(FOO\\\\(BAR)'),
      context,
    );
    expect(() => parser.parseObject()).toThrow();
  });
});
