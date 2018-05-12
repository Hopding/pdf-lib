import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';
import {
  PDFIndirectObject,
  PDFIndirectReference,
  PDFNumber,
  PDFString,
} from 'core/pdf-objects';
import { typedArrayFor } from 'utils';

describe(`PDFString`, () => {
  it(`requires a String to be constructed`, () => {
    expect(() => new PDFString()).toThrowError();
    expect(() => new PDFString([])).toThrowError(
      'Can only construct PDFStrings from Strings',
    );
    expect(new PDFString('foo')).toBeInstanceOf(PDFString);
  });

  it(`has a static "fromString" factory method`, () => {
    expect(() => PDFString.fromString()).toThrowError();
    expect(() => PDFString.fromString([])).toThrowError(
      'Can only construct PDFStrings from Strings',
    );
    expect(PDFString.fromString('foo')).toBeInstanceOf(PDFString);
  });

  describe(`"toString" method`, () => {
    it(`returns the PDFString as a string`, () => {
      const pdfString = PDFString.fromString('FooBar');
      expect(pdfString.toString()).toBe('(FooBar)');
    });

    it(`escapes backslashes`, () => {
      const pdfString = PDFString.fromString('Foo\\Bar\\Qux');
      expect(pdfString.toString()).toBe('(Foo\\\\Bar\\\\Qux)');
    });

    it(`escapes nested parenthesis`, () => {
      const pdfString = PDFString.fromString('(Foo((Bar))Qux)');
      expect(pdfString.toString()).toBe('(\\(Foo\\(\\(Bar\\)\\)Qux\\))');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the PDFString in bytes`, () => {
      const pdfString = PDFString.fromString('Foo\\Bar\\Qux');
      expect(pdfString.bytesSize()).toEqual(15);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the PDFString into the buffer as bytes`, () => {
      const pdfString = PDFString.fromString('Foo\\Bar\\Qux');
      const buffer = new Uint8Array(pdfString.bytesSize());
      pdfString.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor('(Foo\\\\Bar\\\\Qux)'));
    });
  });
});
