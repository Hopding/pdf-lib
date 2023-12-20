import { PDFNumber } from '../../../src/core';
import { toCharCode, typedArrayFor } from '../../../src/utils';

describe(`PDFNumber`, () => {
  it(`can be constructed from PDFNumber.of(...)`, () => {
    expect(PDFNumber.of(21)).toBeInstanceOf(PDFNumber);
    expect(PDFNumber.of(-43)).toBeInstanceOf(PDFNumber);
    expect(PDFNumber.of(-0.1e7)).toBeInstanceOf(PDFNumber);
  });

  it(`can be cloned`, () => {
    const original = PDFNumber.of(-21.42);
    const clone = original.clone();
    expect(clone).not.toBe(original);
    expect(clone.toString()).toBe(original.toString());
  });

  it(`can be converted to a string`, () => {
    expect(String(PDFNumber.of(21))).toEqual('21');
    expect(String(PDFNumber.of(-43))).toEqual('-43');
    expect(String(PDFNumber.of(3.403e38))).toEqual(
      '340300000000000000000000000000000000000',
    );
    expect(String(PDFNumber.of(-3.403e38))).toEqual(
      '-340300000000000000000000000000000000000',
    );
    expect(String(PDFNumber.of(-3.403e-38))).toContain(
      '-0.00000000000000000000000000000000000003403',
    );
  });

  it(`can provide its size in bytes`, () => {
    expect(PDFNumber.of(21).sizeInBytes()).toBe(2);
    expect(PDFNumber.of(-43).sizeInBytes()).toBe(3);
    expect(PDFNumber.of(3.403e38).sizeInBytes()).toBe(39);
    expect(PDFNumber.of(-3.403e38).sizeInBytes()).toBe(40);
  });

  it(`can be serialized`, () => {
    const buffer1 = new Uint8Array(8).fill(toCharCode(' '));
    expect(PDFNumber.of(21).copyBytesInto(buffer1, 3)).toBe(2);
    expect(buffer1).toEqual(typedArrayFor('   21   '));

    const buffer2 = new Uint8Array(40).fill(toCharCode(' '));
    expect(PDFNumber.of(-3.403e38).copyBytesInto(buffer2, 0)).toBe(40);
    expect(buffer2).toEqual(
      typedArrayFor('-340300000000000000000000000000000000000'),
    );
  });
});
