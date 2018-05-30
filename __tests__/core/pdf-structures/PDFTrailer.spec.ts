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
      'PDFTrailer offsets can only be Numbers',
    );
    expect(() => new PDFTrailer(21)).toThrowError(
      'PDFTrailer dictionaries can only be PDFDictionaries',
    );
    expect(
      new PDFTrailer(21, PDFDictionary.from({}, PDFObjectIndex.create())),
    ).toBeInstanceOf(PDFTrailer);
  });

  it(`has a static "from" factory method`, () => {
    expect(() => PDFTrailer.from()).toThrowError();
    expect(() => PDFTrailer.from([])).toThrowError(
      'PDFTrailer offsets can only be Numbers',
    );
    expect(() => PDFTrailer.from(21)).toThrowError(
      'PDFTrailer dictionaries can only be PDFDictionaries',
    );
    expect(
      PDFTrailer.from(21, PDFDictionary.from({}, PDFObjectIndex.create())),
    ).toBeInstanceOf(PDFTrailer);
  });

  describe(`"toString" method`, () => {
    it(`returns the PDFTrailer as a string`, () => {
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
    it(`returns the size of the PDFTrailer in bytes`, () => {
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
    it(`copies the PDFTrailer into the buffer as bytes`, () => {
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
