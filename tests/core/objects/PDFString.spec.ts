import { PDFString } from 'src/core';
import { toCharCode, typedArrayFor } from 'src/utils';

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

  describe.only(`decoding to string`, () => {
    it(`test a`, () => {
      const literal =
        '\\376\\377\\000\\105\\000\\147\\000\\147\\000\\040\\330\\074\\337\\163';
      expect(PDFString.of(literal).decodeText()).toBe('Egg 🍳');
    });

    it(`test b`, () => {
      const literal = '\\376\\377\0E\0g\0g\0 \\330<\\337s';
      expect(PDFString.of(literal).decodeText()).toBe('Egg 🍳');
    });

    it(`test c`, () => {
      const literal = '\\376\\377\0E\\\n\\0g\0g\0 \\330<\\337s';
      expect(PDFString.of(literal).decodeText()).toBe('Egg 🍳');
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

  it(`can construct a date object`, () => {
    // D:YYYYMMDDHHmmSSOHH'mm
    expect(PDFString.toDate("D:20200321165011+01'01")).toStrictEqual(
      new Date('2020-03-21T15:49:11Z'),
    );
    expect(PDFString.toDate("D:20200321165011-01'01")).toStrictEqual(
      new Date('2020-03-21T17:51:11Z'),
    );
    expect(PDFString.toDate("D:20200321165011Z00'00")).toStrictEqual(
      new Date('2020-03-21T16:50:11Z'),
    );
    // D:YYYYMMDDHHmmSSOHH
    expect(PDFString.toDate('D:20200321165011+01')).toStrictEqual(
      new Date('2020-03-21T15:50:11Z'),
    );
    expect(PDFString.toDate('D:20200321165011-01')).toStrictEqual(
      new Date('2020-03-21T17:50:11Z'),
    );
    expect(PDFString.toDate('D:20200321165011Z00')).toStrictEqual(
      new Date('2020-03-21T16:50:11Z'),
    );
    // D:YYYYMMDDHHmmSSO
    expect(PDFString.toDate('D:20200321165011Z')).toStrictEqual(
      new Date('2020-03-21T16:50:11Z'),
    );
    // D:YYYYMMDDHHmmSS
    expect(PDFString.toDate('D:20200321165011')).toStrictEqual(
      new Date('2020-03-21T16:50:11Z'),
    );
    // D:YYYYMMDDHHmm
    expect(PDFString.toDate('D:202003211650')).toStrictEqual(
      new Date('2020-03-21T16:50:00Z'),
    );
    // D:YYYYMMDDHH
    expect(PDFString.toDate('D:2020032116')).toStrictEqual(
      new Date('2020-03-21T16:00:00Z'),
    );
    // D:YYYYMMDD
    expect(PDFString.toDate('D:20200321')).toStrictEqual(
      new Date('2020-03-21T00:00:00Z'),
    );
    // D:YYYYMM
    expect(PDFString.toDate('D:202003')).toStrictEqual(
      new Date('2020-03-01T00:00:00Z'),
    );
    // D:YYYY
    expect(PDFString.toDate('D:2020')).toStrictEqual(
      new Date('2020-01-01T00:00:00Z'),
    );
  });
});
