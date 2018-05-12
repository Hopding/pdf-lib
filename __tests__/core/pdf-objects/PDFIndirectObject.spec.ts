import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';
import {
  PDFIndirectObject,
  PDFIndirectReference,
  PDFNumber,
  PDFString,
} from 'core/pdf-objects';
import { typedArrayFor } from 'utils';

describe(`PDFIndirectObject`, () => {
  it(`requires a PDFObject to be constructed`, () => {
    expect(() => new PDFIndirectObject()).toThrowError();
    expect(() => new PDFIndirectObject('foo')).toThrowError(
      'PDFIndirectObject.pdfObject must be of type PDFObject',
    );
    expect(new PDFIndirectObject(PDFString.fromString('foo'))).toBeInstanceOf(
      PDFIndirectObject,
    );
  });

  it(`has a static "of" factory method`, () => {
    expect(() => PDFIndirectObject.of()).toThrowError();
    expect(() => PDFIndirectObject.of('foo')).toThrowError(
      'PDFIndirectObject.pdfObject must be of type PDFObject',
    );
    expect(PDFIndirectObject.of(PDFString.fromString('foo'))).toBeInstanceOf(
      PDFIndirectObject,
    );
  });

  describe(`"getReference" method`, () => {
    it(`returns the PDFIndirectObject's reference member`, () => {
      const indirectObj = PDFIndirectObject.of(
        PDFString.fromString('foo'),
      ).setReferenceNumbers(0, 1);
      expect(indirectObj.getReference()).toBe(
        PDFIndirectReference.forNumbers(0, 1),
      );
    });
  });

  describe(`"setReferenceNumbers" method`, () => {
    it(`requires 2 numbers as arguments`, () => {
      const indirectObj = PDFIndirectObject.of(PDFString.fromString('foo'));
      expect(() => indirectObj.setReferenceNumbers('0', '1')).toThrowError(
        'objectNumber must be a Number',
      );
      expect(() => indirectObj.setReferenceNumbers(0, '1')).toThrowError(
        'generationNumber must be a Number',
      );
    });

    it(`updates the PDFIndirectObject's reference member`, () => {
      const indirectObj = PDFIndirectObject.of(PDFString.fromString('foo'));
      expect(indirectObj.getReference()).toBe(undefined);
      expect(indirectObj.setReferenceNumbers(0, 1)).toBe(indirectObj);
      expect(indirectObj.getReference()).toBe(
        PDFIndirectReference.forNumbers(0, 1),
      );
    });
  });

  describe(`"setReference" method`, () => {
    it(`requires a PDFIndirectReference as its argument`, () => {
      const indirectObj = PDFIndirectObject.of(PDFString.fromString('foo'));
      expect(() => indirectObj.setReference('0')).toThrowError(
        '"reference" must be a PDFIndirectReference object',
      );
    });

    it(`updates the PDFIndirectObject's reference member`, () => {
      const indirectObj = PDFIndirectObject.of(PDFString.fromString('foo'));
      expect(indirectObj.getReference()).toBe(undefined);
      expect(
        indirectObj.setReference(PDFIndirectReference.forNumbers(0, 1)),
      ).toBe(indirectObj);
      expect(indirectObj.getReference()).toBe(
        PDFIndirectReference.forNumbers(0, 1),
      );
    });
  });

  describe(`"toReference" method`, () => {
    it(`returns the PDFIndirectObject's refernece member as a string`, () => {
      const indirectObj = PDFIndirectObject.of(
        PDFString.fromString('foo'),
      ).setReferenceNumbers(0, 1);
      expect(indirectObj.toReference()).toEqual('0 1 R');
    });
  });

  describe(`"toString" method`, () => {
    it(`returns the PDFIndirectObject as a string`, () => {
      const indirectObj = PDFIndirectObject.of(
        PDFString.fromString('foo'),
      ).setReferenceNumbers(0, 1);
      expect(indirectObj.toString()).toEqual(`0 1 obj\n(foo)\nendobj\n\n`);
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the PDFIndirectObject in bytes`, () => {
      const indirectObj = PDFIndirectObject.of(
        PDFString.fromString('foo'),
      ).setReferenceNumbers(0, 1);
      expect(indirectObj.bytesSize()).toEqual(22);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the PDFIndirectObject into the buffer as bytes`, () => {
      const indirectObj = PDFIndirectObject.of(
        PDFString.fromString('foo'),
      ).setReferenceNumbers(0, 1);
      const buffer = new Uint8Array(indirectObj.bytesSize());
      indirectObj.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor('0 1 obj\n(foo)\nendobj\n\n'));
    });
  });
});
