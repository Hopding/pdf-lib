import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';
import {
  PDFIndirectObject,
  PDFIndirectReference,
  PDFNumber,
  PDFString,
} from 'core/pdf-objects';
import { typedArrayFor } from 'utils';

describe(`PDFIndirectReference`, () => {
  it(`does not allow its constructor to be called`, () => {
    expect(() => new PDFIndirectReference()).toThrowError(
      'Cannot create PDFIndirectReference via constructor. Use PDFIndirectReference.forNumbers instead.',
    );
  });

  describe(`static "forNumbers" factory method`, () => {
    it(`requires two numbers as its arguments`, () => {
      expect(() => PDFIndirectReference.forNumbers('0', '1')).toThrowError(
        'objectNumber must be a Number',
      );
      expect(() => PDFIndirectReference.forNumbers(0, '1')).toThrowError(
        'generationNumber must be a Number',
      );
    });

    it(`returns a PDFIndirectReference object`, () => {
      expect(PDFIndirectReference.forNumbers(0, 1)).toBeInstanceOf(
        PDFIndirectReference,
      );
    });

    it(`creates a singleton for each pair of numbers`, () => {
      const refZeroOne = PDFIndirectReference.forNumbers(0, 1);
      const refTwoThree = PDFIndirectReference.forNumbers(2, 3);

      expect(refZeroOne).toBe(PDFIndirectReference.forNumbers(0, 1));
      expect(refTwoThree).toBe(PDFIndirectReference.forNumbers(2, 3));

      expect(refZeroOne).not.toBe(refTwoThree);
    });
  });

  describe(`"toString" method`, () => {
    it(`returns the PDFIndirectReference as a string`, () => {
      const indirectRef = PDFIndirectReference.forNumbers(0, 1);
      expect(indirectRef.toString()).toEqual('0 1 R');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the PDFIndirectReference in bytes`, () => {
      const indirectRef = PDFIndirectReference.forNumbers(0, 1);
      expect(indirectRef.bytesSize()).toEqual(5);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the PDFIndirectReference into the buffer as bytes`, () => {
      const indirectRef = PDFIndirectReference.forNumbers(0, 1);
      const buffer = new Uint8Array(indirectRef.bytesSize());
      indirectRef.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor('0 1 R'));
    });
  });
});
