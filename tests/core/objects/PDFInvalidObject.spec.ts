import { PDFInvalidObject } from '../../../src/core';

describe(`PDFInvalidObject`, () => {
  const data = new Uint8Array([12, 39, 92, 38, 38, 28, 49]);

  it(`can be constructed from PDFInvalidObject.of(...)`, () => {
    expect(PDFInvalidObject.of(data)).toBeInstanceOf(PDFInvalidObject);
  });

  it(`can be cloned`, () => {
    const original = PDFInvalidObject.of(data);
    const clone = original.clone();
    expect(clone).not.toBe(original);
    expect(clone.toString()).toEqual(original.toString());
  });

  it(`can be converted to a string`, () => {
    expect(String(PDFInvalidObject.of(data))).toBe('PDFInvalidObject(7 bytes)');
  });

  it(`can provide its size in bytes`, () => {
    expect(PDFInvalidObject.of(data).sizeInBytes()).toBe(7);
  });

  it(`can be serialized`, () => {
    const buffer = new Uint8Array(11).fill(0);
    expect(PDFInvalidObject.of(data).copyBytesInto(buffer, 3)).toBe(7);
    expect(buffer).toEqual(
      new Uint8Array([0, 0, 0, 12, 39, 92, 38, 38, 28, 49, 0]),
    );
  });
});
