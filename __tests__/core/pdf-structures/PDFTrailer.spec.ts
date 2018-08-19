import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';
import {
  PDFDictionary,
  PDFIndirectObject,
  PDFIndirectReference,
  PDFNumber,
  PDFString,
} from 'core/pdf-objects';
import { PDFTrailer } from 'core/pdf-structures';
import { typedArrayFor } from 'utils';

describe(`PDFTrailer`, () => {
  it(`requires a Number and PDFDictionary to be constructed`, () => {
    expect(() => new PDFTrailer()).toThrowError();
    expect(() => new PDFTrailer([])).toThrowError(
      'PDFTrailer.offset must be a number',
    );
    expect(() => new PDFTrailer(21, {})).toThrowError(
      'PDFTrailer.dictionary must be instance of PDFDictionary or undefined',
    );
    expect(
      new PDFTrailer(21, PDFDictionary.from({}, PDFObjectIndex.create())),
    ).toBeInstanceOf(PDFTrailer);
  });

  it(`has a static "from" factory method`, () => {
    expect(() => PDFTrailer.from()).toThrowError();
    expect(() => PDFTrailer.from([])).toThrowError(
      'PDFTrailer.offset must be a number',
    );
    expect(() => PDFTrailer.from(21, {})).toThrowError(
      'PDFTrailer.dictionary must be instance of PDFDictionary or undefined',
    );
    expect(
      PDFTrailer.from(21, PDFDictionary.from({}, PDFObjectIndex.create())),
    ).toBeInstanceOf(PDFTrailer);
  });

  describe(`"toString" method`, () => {
    it(`returns the PDFTrailer without a dictionary as a string`, () => {
      const pdfTrailer = PDFTrailer.from(2921);
      expect(pdfTrailer.toString()).toBe(`startxref\n` + `2921\n` + `%%EOF\n`);
    });

    it(`returns the PDFTrailer with a dictionary as a string`, () => {
      const pdfTrailer = PDFTrailer.from(
        2921,
        PDFDictionary.from(
          { Foo: PDFString.fromString('Bar') },
          PDFObjectIndex.create(),
        ),
      );
      expect(pdfTrailer.toString()).toBe(
        `trailer\n` +
          `<<\n/Foo (Bar)\n>>\n` +
          `startxref\n` +
          `2921\n` +
          `%%EOF\n`,
      );
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the PDFTrailer without a dictionary in bytes`, () => {
      const pdfTrailer = PDFTrailer.from(2921);
      expect(pdfTrailer.bytesSize()).toBe(21);
    });

    it(`returns the size of the PDFTrailer with a dictionary in bytes`, () => {
      const pdfTrailer = PDFTrailer.from(
        2921,
        PDFDictionary.from(
          { Foo: PDFString.fromString('Bar') },
          PDFObjectIndex.create(),
        ),
      );
      expect(pdfTrailer.bytesSize()).toBe(46);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the PDFTrailer without a dictionary into the buffer as bytes`, () => {
      const pdfTrailer = PDFTrailer.from(2921);

      const bytes = new Uint8Array(pdfTrailer.bytesSize());
      pdfTrailer.copyBytesInto(bytes);

      expect(bytes).toEqual(
        typedArrayFor(`startxref\n` + `2921\n` + `%%EOF\n`),
      );
    });

    it(`copies the PDFTrailer with a dictionary into the buffer as bytes`, () => {
      const pdfTrailer = PDFTrailer.from(
        2921,
        PDFDictionary.from(
          { Foo: PDFString.fromString('Bar') },
          PDFObjectIndex.create(),
        ),
      );

      const bytes = new Uint8Array(pdfTrailer.bytesSize());
      pdfTrailer.copyBytesInto(bytes);

      expect(bytes).toEqual(
        typedArrayFor(
          `trailer\n` +
            `<<\n/Foo (Bar)\n>>\n` +
            `startxref\n` +
            `2921\n` +
            `%%EOF\n`,
        ),
      );
    });
  });
});
