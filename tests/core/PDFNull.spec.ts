import { PDFNull } from 'src/core';
import { typedArrayFor, toCharCode } from 'src/utils';

describe(`PDFNull`, () => {
  it(`cannot be publicly constructed`, () => {
    expect(() => new (PDFNull as any)()).toThrow();
  });

  it(`can be cloned`, () => {
    expect(PDFNull.clone()).toBe(PDFNull);
  });

  it(`can be converted to a string`, () => {
    expect(String(PDFNull)).toBe('null');
  });

  it(`can provide its size in bytes`, () => {
    expect(PDFNull.sizeInBytes()).toBe(4);
  });

  it(`can be serialized`, () => {
    const buffer = new Uint8Array(8).fill(toCharCode(' '));
    PDFNull.copyBytesInto(buffer, 3);
    expect(buffer).toEqual(typedArrayFor('   null '));
  });
});
