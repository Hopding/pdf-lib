import { PDFNumber } from 'core/pdf-objects';
import { toCharCode, typedArrayFor } from 'utils';

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

  describe(`"clone" method`, () => {
    it(`returns a shallow clone of the PDFNumber`, () => {
      const origNumber = PDFNumber.fromNumber(21);
      const clonedNumber = origNumber.clone();
      expect(clonedNumber).not.toBe(origNumber);
      expect(clonedNumber.number).toBe(origNumber.number);
    });
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

  it(`can be converted to a string`, () => {
    expect(String(PDFNumber.fromNumber(21))).toEqual('21');
    expect(String(PDFNumber.fromNumber(-43))).toEqual('-43');
    expect(String(PDFNumber.fromNumber(3.403e38))).toEqual(
      '340300000000000000000000000000000000000',
    );
    expect(String(PDFNumber.fromNumber(-3.403e38))).toEqual(
      '-340300000000000000000000000000000000000',
    );
    expect(String(PDFNumber.fromNumber(-3.403e-38))).toEqual(
      '-0.000000000000000000000000000000000000034030000000000005',
    );
  });

  it(`can provide its size in bytes`, () => {
    expect(PDFNumber.fromNumber(21).bytesSize()).toBe(2);
    expect(PDFNumber.fromNumber(-43).bytesSize()).toBe(3);
    expect(PDFNumber.fromNumber(3.403e38).bytesSize()).toBe(39);
    expect(PDFNumber.fromNumber(-3.403e38).bytesSize()).toBe(40);
  });

  it(`can be serialized`, () => {
    const buffer1 = new Uint8Array(8).fill(toCharCode(' '));
    PDFNumber.fromNumber(21).copyBytesInto(buffer1);

    expect(buffer1).toEqual(typedArrayFor('21      '));

    const buffer2 = new Uint8Array(40).fill(toCharCode(' '));
    PDFNumber.fromNumber(-3.403e38).copyBytesInto(buffer2);
    expect(buffer2).toEqual(
      typedArrayFor('-340300000000000000000000000000000000000'),
    );

    const buffer3 = new Uint8Array(64).fill(toCharCode(' '));
    PDFNumber.fromNumber(-3.403e-38).copyBytesInto(buffer3);
    expect(buffer3).toEqual(
      typedArrayFor(
        '-0.000000000000000000000000000000000000034030000000000005       ',
      ),
    );
  });
});
