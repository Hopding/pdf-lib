import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';
import {
  PDFArray,
  PDFIndirectObject,
  PDFIndirectReference,
  PDFNumber,
  PDFString,
} from 'core/pdf-objects';
import { typedArrayFor } from 'utils';

describe(`PDFArray`, () => {
  it(`requires an array of PDFObjects and a PDFObjectIndex to be constructed`, () => {
    expect(() => new PDFArray()).toThrowError();
    expect(() => new PDFArray(['foo'])).toThrowError(
      'Cannot construct PDFArray from array whose elements are not PDFObjects',
    );
    expect(() => new PDFArray([PDFString.fromString('foo')])).toThrowError(
      '"index" must be a an instance of PDFObjectIndex',
    );
    expect(
      new PDFArray([PDFString.fromString('foo')], PDFObjectIndex.create()),
    ).toBeInstanceOf(PDFArray);
  });

  it(`has a static "fromArray" factory method`, () => {
    expect(() => PDFArray.fromArray()).toThrowError();
    expect(() => PDFArray.fromArray(['foo'])).toThrowError(
      'Cannot construct PDFArray from array whose elements are not PDFObjects',
    );
    expect(() =>
      PDFArray.fromArray([PDFString.fromString('foo')]),
    ).toThrowError('"index" must be a an instance of PDFObjectIndex');
    expect(
      PDFArray.fromArray(
        [PDFString.fromString('foo')],
        PDFObjectIndex.create(),
      ),
    ).toBeInstanceOf(PDFArray);
  });

  describe(`"push" method`, () => {
    it(`requires its arguments to be PDFObjects`, () => {
      const pdfArray = PDFArray.fromArray([], PDFObjectIndex.create());
      expect(() => pdfArray.push('foo')).toThrowError(
        'PDFArray.push() requires arguments to be PDFObjects',
      );
    });

    it(`pushes its arguments to the "array" member and returns "this"`, () => {
      const pdfArray = PDFArray.fromArray([], PDFObjectIndex.create());
      expect(
        pdfArray.push(PDFString.fromString('foo'), PDFNumber.fromNumber(9000)),
      ).toBe(pdfArray);
      expect(pdfArray.array).toEqual([
        expect.any(PDFString),
        expect.any(PDFNumber),
      ]);
    });
  });

  describe(`"set" method`, () => {
    it(`requires a number and a PDFObject as arguments`, () => {
      const pdfArray = PDFArray.fromArray([], PDFObjectIndex.create());
      expect(() => pdfArray.set('0', PDFString.fromString('foo'))).toThrowError(
        'PDFArray.set() requires indexes to be numbers',
      );
      expect(() => pdfArray.set(0, 'foo')).toThrowError(
        'PDFArray.set() requires values to be PDFObjects',
      );
    });

    it(`updates the "array" member`, () => {
      const pdfArray = PDFArray.fromArray([], PDFObjectIndex.create());
      expect(pdfArray.set(0, PDFString.fromString('foo'))).toBe(pdfArray);
      expect(pdfArray.array[0]).toEqual(expect.any(PDFString));
    });
  });

  describe(`"get" method`, () => {
    it(`requires a number as its argument`, () => {
      const pdfArray = PDFArray.fromArray([], PDFObjectIndex.create());
      expect(() => pdfArray.get('0')).toThrowError(
        'PDFArray.set() requires indexes to be numbers',
      );
    });

    it(`returns the value in the "array" member at the given index`, () => {
      const pdfArray = PDFArray.fromArray(
        [PDFString.fromString('foo'), PDFNumber.fromNumber(9000)],
        PDFObjectIndex.create(),
      );
      expect(pdfArray.get(0)).toEqual(expect.any(PDFString));
    });
  });

  describe(`"toString" method`, () => {
    it(`returns the PDFArray as a string`, () => {
      const pdfNumber = PDFNumber.fromNumber(9000);
      const pdfArray = PDFArray.fromArray(
        [
          PDFString.fromString('foo'),
          PDFIndirectObject.of(pdfNumber).setReferenceNumbers(1, 2),
        ],
        PDFObjectIndex.create(),
      );

      expect(pdfArray.toString()).toEqual('[ (foo) 1 2 R ]');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the PDFArray in bytes`, () => {
      const pdfNumber = PDFNumber.fromNumber(9000);
      const pdfArray = PDFArray.fromArray(
        [
          PDFString.fromString('foo'),
          PDFIndirectObject.of(pdfNumber).setReferenceNumbers(1, 2),
        ],
        PDFObjectIndex.create(),
      );
      expect(pdfArray.bytesSize()).toEqual(15);
    });

    it(`throws an error if it encounters a non PDFObject in the PDFArray`, () => {
      const pdfArray = PDFArray.fromArray([], PDFObjectIndex.create());
      pdfArray.array.push('foo');
      expect(() => pdfArray.bytesSize()).toThrowError('Not a PDFObject: foo');
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the PDFArray into the buffer as bytes`, () => {
      const pdfNumber = PDFNumber.fromNumber(9000);
      const pdfArray = PDFArray.fromArray(
        [
          PDFString.fromString('foo'),
          PDFIndirectObject.of(pdfNumber).setReferenceNumbers(1, 2),
        ],
        PDFObjectIndex.create(),
      );
      const buffer = new Uint8Array(pdfArray.bytesSize());
      pdfArray.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor('[ (foo) 1 2 R ]'));
    });
  });

  it(`throws an error if it encounters a non PDFObject in the PDFArray`, () => {
    const pdfArray = PDFArray.fromArray([], PDFObjectIndex.create());
    pdfArray.array.push('foo');
    const buffer = new Uint8Array(0);
    expect(() => pdfArray.copyBytesInto(buffer)).toThrowError(
      'Not a PDFObject: foo',
    );
  });
});
