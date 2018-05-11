import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';
import {
  PDFBoolean,
  PDFIndirectObject,
  PDFIndirectReference,
  PDFNumber,
  PDFString,
} from 'core/pdf-objects';
import { typedArrayFor } from 'utils';

describe(`PDFBoolean`, () => {
  it(`requires a boolean to be constructed`, () => {
    expect(() => new PDFBoolean()).toThrowError();
    expect(() => new PDFBoolean('true')).toThrowError(
      'Can only construct PDFBooleans from Booleans',
    );
    expect(new PDFBoolean(true)).toBeInstanceOf(PDFBoolean);
  });

  it(`has a static "fromBool" factory method`, () => {
    expect(() => PDFBoolean.fromBool()).toThrowError();
    expect(() => PDFBoolean.fromBool('true')).toThrowError(
      'Can only construct PDFBooleans from Booleans',
    );
    expect(PDFBoolean.fromBool(true)).toBeInstanceOf(PDFBoolean);
  });

  it(`has a static "fromString" factory method`, () => {
    expect(() => PDFBoolean.fromString()).toThrowError();
    expect(PDFBoolean.fromString('true')).toBeInstanceOf(PDFBoolean);
  });

  describe(`"toString()" method`, () => {
    it(`returns the PDFBoolean as a string`, () => {
      const pdfBoolTrue = PDFBoolean.fromBool(true);
      expect(pdfBoolTrue.toString()).toEqual('true');

      const pdfBoolFalse = PDFBoolean.fromBool(false);
      expect(pdfBoolFalse.toString()).toEqual('false');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the PDFBoolean in bytes`, () => {
      const pdfBoolTrue = PDFBoolean.fromBool(true);
      expect(pdfBoolTrue.bytesSize()).toEqual(4);

      const pdfBoolFalse = PDFBoolean.fromBool(false);
      expect(pdfBoolFalse.bytesSize()).toEqual(5);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the PDFBoolean into the buffer as bytes`, () => {
      const pdfBoolTrue = PDFBoolean.fromBool(true);
      const trueBuffer = new Uint8Array(pdfBoolTrue.bytesSize());
      pdfBoolTrue.copyBytesInto(trueBuffer);
      expect(trueBuffer).toEqual(typedArrayFor('true'));

      const pdfBoolFalse = PDFBoolean.fromBool(false);
      const falseBuffer = new Uint8Array(pdfBoolFalse.bytesSize());
      pdfBoolFalse.copyBytesInto(falseBuffer);
      expect(falseBuffer).toEqual(typedArrayFor('false'));
    });
  });
});
