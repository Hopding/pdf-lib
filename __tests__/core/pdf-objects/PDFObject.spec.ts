import { PDFObject } from 'core/pdf-objects';

describe(`PDFDictionary`, () => {
  it(`requires no arguments to be constructed`, () => {
    expect(new PDFObject()).toBeInstanceOf(PDFObject);
  });

  describe(`"toString" method`, () => {
    it(`throws an error`, () => {
      const pdfObject = new PDFObject();
      expect(() => pdfObject.toString()).toThrowError(
        `toString() is not implemented on PDFObject`,
      );
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`throws an error`, () => {
      const pdfObject = new PDFObject();
      expect(() => pdfObject.bytesSize()).toThrowError(
        `bytesSize() is not implemented on PDFObject`,
      );
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`throws an error`, () => {
      const pdfObject = new PDFObject();
      expect(() => pdfObject.copyBytesInto()).toThrowError(
        `copyBytesInto() is not implemented on PDFObject`,
      );
    });
  });
});
