import { PDFString } from 'src/core';
import { toCharCode, typedArrayFor } from 'src/utils';

describe(`PDFString`, () => {
  it(`can be constructed from PDFString.of(...)`, () => {
    expect(PDFString.of('foobar')).toBeInstanceOf(PDFString);
    expect(PDFString.of(' (foo(bar))')).toBeInstanceOf(PDFString);
    expect(PDFString.of(')b\\a/z(')).toBeInstanceOf(PDFString);
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
