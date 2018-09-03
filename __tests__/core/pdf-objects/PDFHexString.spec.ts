import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';
import { PDFHexString } from 'core/pdf-objects';
import { typedArrayFor } from 'utils';

describe(`PDFHexString`, () => {
  it(`requires a valid String to be constructed`, () => {
    expect(() => new PDFHexString()).toThrowError();
    expect(() => new PDFHexString(9191)).toThrowError(
      'PDFHexString.string must be a String',
    );
    expect(() => new PDFHexString('!@3$@')).toThrowError(
      'Invalid characters in hex string: "!@3$@"',
    );
    expect(new PDFHexString('2\u00001\tA\nB\fC\ra bc')).toBeInstanceOf(
      PDFHexString,
    );
  });

  it(`has a static "fromString" factory method`, () => {
    expect(() => PDFHexString.fromString()).toThrowError();
    expect(() => PDFHexString.fromString(9191)).toThrowError(
      'PDFHexString.string must be a String',
    );
    expect(() => PDFHexString.fromString('!@3$@')).toThrowError(
      'Invalid characters in hex string: "!@3$@"',
    );
    expect(PDFHexString.fromString('2\u00001\tA\nB\fC\ra bc')).toBeInstanceOf(
      PDFHexString,
    );
  });

  describe(`"toString()" method`, () => {
    it(`returns the PDFHexString as a string`, () => {
      const pdfHexString = PDFHexString.fromString('12ABCabc');
      expect(pdfHexString.toString()).toEqual('<12ABCabc>');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the PDFHexString in bytes`, () => {
      const pdfHexString = PDFHexString.fromString('12ABCabc');
      expect(pdfHexString.bytesSize()).toEqual(10);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the PDFHexString into the buffer as bytes`, () => {
      const pdfHexString = PDFHexString.fromString('12ABCabc');
      const buffer = new Uint8Array(pdfHexString.bytesSize());
      pdfHexString.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor('<12ABCabc>'));
    });
  });
});
