import { PDFString } from '../../../src/core';
import { toCharCode, typedArrayFor } from '../../../src/utils';

describe(`PDFString`, () => {
  it(`can be constructed from PDFString.of(...)`, () => {
    expect(PDFString.of('foobar')).toBeInstanceOf(PDFString);
    expect(PDFString.of(' (foo(bar))')).toBeInstanceOf(PDFString);
    expect(PDFString.of(')b\\a/z(')).toBeInstanceOf(PDFString);
  });

  it(`can be constructed from a Date object`, () => {
    const date1 = new Date('2018-06-24T01:58:37.228Z');
    expect(String(PDFString.fromDate(date1))).toBe('(D:20180624015837Z)');

    const date2 = new Date('2019-12-21T07:00:11.000Z');
    expect(String(PDFString.fromDate(date2))).toBe('(D:20191221070011Z)');
  });

  it(`can be converted to a string`, () => {
    expect(PDFString.of('foobar').asString()).toBe('foobar');

    const date = new Date('2018-06-24T01:58:37.228Z');
    expect(PDFString.fromDate(date).asString()).toBe('D:20180624015837Z');
  });

  it(`can be cloned`, () => {
    const original = PDFString.of(')b\\a/z(');
    const clone = original.clone();
    expect(clone).not.toBe(original);
    expect(clone.toString()).toBe(original.toString());
  });

  describe(`conversion to string`, () => {
    it(`can be converted to a string`, () => {
      expect(String(PDFString.of('foobar'))).toBe('(foobar)');
    });

    it(`does not escape backslashes`, () => {
      expect(String(PDFString.of('Foo\\Bar\\Qux'))).toBe('(Foo\\Bar\\Qux)');
    });

    it(`does not escape nested parenthesis`, () => {
      expect(String(PDFString.of('(Foo((Bar))Qux)'))).toBe('((Foo((Bar))Qux))');
    });
  });

  describe(`converting to bytes`, () => {
    it(`can interpret escaped octal codes`, () => {
      const literal =
        '\\376\\377\\000\\105\\000\\147\\000\\147\\000\\040\\330\\074\\337\\163';

      // prettier-ignore
      expect(PDFString.of(literal).asBytes()).toEqual(Uint8Array.of(
        0o376, 0o377,
        0o000, 0o105,
        0o000, 0o147,
        0o000, 0o147,
        0o000, 0o040,
        0o330, 0o074,
        0o337, 0o163,
      ));
    });

    it(`can interpret ASCII symbols`, () => {
      const literal = '\\376\\377\0E\0g\0g\0 \\330<\\337s';

      // prettier-ignore
      expect(PDFString.of(literal).asBytes()).toEqual(Uint8Array.of(
        0o376, 0o377,
        toCharCode('\0'), toCharCode('E'),
        toCharCode('\0'), toCharCode('g'),
        toCharCode('\0'), toCharCode('g'),
        toCharCode('\0'), toCharCode(' '),
        0o330, toCharCode('<'),  
        0o337, toCharCode('s'),
      ));
    });

    it(`can ignore line breaks`, () => {
      const literal = '\\376\\377\0E\\\n\\0g\0g\0 \\330<\\337s';

      // prettier-ignore
      expect(PDFString.of(literal).asBytes()).toEqual(Uint8Array.of(
        0o376, 0o377,
        toCharCode('\0'), toCharCode('E'),
        toCharCode('\0'), toCharCode('g'),
        toCharCode('\0'), toCharCode('g'),
        toCharCode('\0'), toCharCode(' '),
        0o330, toCharCode('<'),  
        0o337, toCharCode('s'),
      ));
    });

    it(`can interpret EOLs and line breaks`, () => {
      const literal = 'a\nb\rc\\\nd\\\re';

      // prettier-ignore
      expect(PDFString.of(literal).asBytes()).toEqual(Uint8Array.of(
        toCharCode('a'), toCharCode('\n'),
        toCharCode('b'), toCharCode('\r'),
        toCharCode('c'), toCharCode('d'), 
        toCharCode('e'),
      ));
    });

    it(`can interpret invalid escapes`, () => {
      const literal = 'a\nb\rc\\xd\\;';

      // prettier-ignore
      expect(PDFString.of(literal).asBytes()).toEqual(Uint8Array.of(
        toCharCode('a'), toCharCode('\n'),
        toCharCode('b'), toCharCode('\r'),
        toCharCode('c'), toCharCode('x'),
        toCharCode('d'), toCharCode(';'),
      ));
    });
  });

  describe(`decoding to string`, () => {
    it(`can interpret UTF-16BE strings with escaped octal codes`, () => {
      const literal =
        '\\376\\377\\000\\105\\000\\147\\000\\147\\000\\040\\330\\074\\337\\163';
      expect(PDFString.of(literal).decodeText()).toBe('Egg 🍳');
    });

    it(`can interpret UTF-16BE strings with ASCII symbols`, () => {
      const literal = '\\376\\377\0E\0g\0g\0 \\330<\\337s';
      expect(PDFString.of(literal).decodeText()).toBe('Egg 🍳');
    });

    it(`can interpret UTF-16BE strings with line breaks`, () => {
      const literal = '\\376\\377\0E\\\n\\0g\0g\0 \\330<\\337s';
      expect(PDFString.of(literal).decodeText()).toBe('Egg 🍳');
    });

    it(`can interpret UTF-16LE strings with escaped octal codes`, () => {
      const literal =
        '\\377\\376\\105\\000\\147\\000\\147\\000\\040\\000\\074\\330\\163\\337';
      expect(PDFString.of(literal).decodeText()).toBe('Egg 🍳');
    });

    it(`can interpret PDFDocEncoded strings`, () => {
      const literal = 'a\\105b\\163\\0b6';
      expect(PDFString.of(literal).decodeText()).toBe('aEbs\0b6');
    });

    it(`can interpret PDFDocEncoded strings with EOLs and line breaks`, () => {
      const literal = 'a\nb\rc\\\nd\\\re';
      expect(PDFString.of(literal).decodeText()).toBe('a\nb\rcde');
    });

    it(`can interpret PDFDocEncoded strings with ignored escapes`, () => {
      const literal = 'a\nb\rc\\xd\\;';
      expect(PDFString.of(literal).decodeText()).toBe('a\nb\rcxd;');
    });
  });

  describe(`decoding to date`, () => {
    it(`can interpret date strings of the form D:YYYYMMDDHHmmSSOHH'mm`, () => {
      expect(PDFString.of(`D:20200321165011+01'01`).decodeDate()).toStrictEqual(
        new Date('2020-03-21T15:49:11Z'),
      );
      expect(PDFString.of(`D:20200321165011-01'01`).decodeDate()).toStrictEqual(
        new Date('2020-03-21T17:51:11Z'),
      );
      expect(PDFString.of(`D:20200321165011Z00'00`).decodeDate()).toStrictEqual(
        new Date('2020-03-21T16:50:11Z'),
      );
    });

    it(`can interpret date strings of the form D:YYYYMMDDHHmmSSOHH`, () => {
      expect(PDFString.of('D:20200321165011+01').decodeDate()).toStrictEqual(
        new Date('2020-03-21T15:50:11Z'),
      );
      expect(PDFString.of('D:20200321165011-01').decodeDate()).toStrictEqual(
        new Date('2020-03-21T17:50:11Z'),
      );
      expect(PDFString.of('D:20200321165011Z00').decodeDate()).toStrictEqual(
        new Date('2020-03-21T16:50:11Z'),
      );
    });

    it(`can interpret date strings of the form D:YYYYMMDDHHmmSSO`, () => {
      expect(PDFString.of('D:20200321165011Z').decodeDate()).toStrictEqual(
        new Date('2020-03-21T16:50:11Z'),
      );
    });

    it(`can interpret date strings of the form D:YYYYMMDDHHmmSS`, () => {
      expect(PDFString.of('D:20200321165011').decodeDate()).toStrictEqual(
        new Date('2020-03-21T16:50:11Z'),
      );
    });

    it(`can interpret date strings of the form D:YYYYMMDDHHmm`, () => {
      expect(PDFString.of('D:202003211650').decodeDate()).toStrictEqual(
        new Date('2020-03-21T16:50:00Z'),
      );
    });

    it(`can interpret date strings of the form D:YYYYMMDDHH`, () => {
      expect(PDFString.of('D:2020032116').decodeDate()).toStrictEqual(
        new Date('2020-03-21T16:00:00Z'),
      );
    });

    it(`can interpret date strings of the form D:YYYYMMDD`, () => {
      expect(PDFString.of('D:20200321').decodeDate()).toStrictEqual(
        new Date('2020-03-21T00:00:00Z'),
      );
    });

    it(`can interpret date strings of the form D:YYYYMM`, () => {
      expect(PDFString.of('D:202003').decodeDate()).toStrictEqual(
        new Date('2020-03-01T00:00:00Z'),
      );
    });

    it(`can interpret date strings of the form D:YYYY`, () => {
      expect(PDFString.of('D:2020').decodeDate()).toStrictEqual(
        new Date('2020-01-01T00:00:00Z'),
      );
    });
  });

  it(`can provide its size in bytes`, () => {
    expect(PDFString.of('foobar').sizeInBytes()).toBe(8);
    expect(PDFString.of(' (foo(bar))').sizeInBytes()).toBe(13);
    expect(PDFString.of(')b\\a/z(').sizeInBytes()).toBe(9);
  });

  it(`can be serialized`, () => {
    const buffer = new Uint8Array(20).fill(toCharCode(' '));
    expect(PDFString.of(')(b\\a/))z(').copyBytesInto(buffer, 3)).toBe(12);
    expect(buffer).toEqual(typedArrayFor('   ()(b\\a/))z()     '));
  });
});
