import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';
import {
  PDFIndirectObject,
  PDFIndirectReference,
  PDFNumber,
  PDFNumber,
  PDFString,
} from 'core/pdf-objects';
import { typedArrayFor } from 'utils';

describe(`PDFNumber`, () => {
  it(`requires a number to be constructed`, () => {
    expect(() => new PDFNumber()).toThrowError();
    expect(() => new PDFNumber('foo')).toThrowError(
      'Can only construct PDFNumbers from Numbers',
    );
    expect(new PDFNumber(9021)).toBeInstanceOf(PDFNumber);
  });

  it(`has a static "fromNumber" factory method`, () => {
    expect(() => PDFNumber.fromNumber()).toThrowError();
    expect(() => PDFNumber.fromNumber('foo')).toThrowError(
      'Can only construct PDFNumbers from Numbers',
    );
    expect(PDFNumber.fromNumber(9021)).toBeInstanceOf(PDFNumber);
  });

  it(`has a static "fromString" factory method`, () => {
    expect(() => PDFNumber.fromString()).toThrowError();
    expect(() => PDFNumber.fromString([])).toThrowError(
      'PDFNumber.fromString requires a string as a parameter.',
    );
    expect(() => PDFNumber.fromString('[]')).toThrowError(
      'Can only construct PDFNumbers from Numbers',
    );
    expect(PDFNumber.fromString('9021')).toBeInstanceOf(PDFNumber);
  });

  describe(`"toString" method`, () => {
    it(`returns the PDFNumber as a string`, () => {
      const pdfNumber = PDFNumber.fromNumber(9000);
      expect(pdfNumber.toString()).toEqual('9000');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the PDFNumber in bytes`, () => {
      const pdfNumber = PDFNumber.fromNumber(9000);
      expect(pdfNumber.bytesSize()).toEqual(4);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the PDFNumber into the buffer as bytes`, () => {
      const pdfNumber = PDFNumber.fromNumber(9000);
      const buffer = new Uint8Array(pdfNumber.bytesSize());
      pdfNumber.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor('9000'));
    });
  });
});
