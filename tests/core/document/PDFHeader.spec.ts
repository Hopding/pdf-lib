import { PDFHeader } from '../../../src/core';
import { toCharCode, typedArrayFor } from '../../../src/utils';

describe(`PDFHeader`, () => {
  it(`can be constructed from PDFHeader.forVersion(...)`, () => {
    expect(PDFHeader.forVersion(1, 2)).toBeInstanceOf(PDFHeader);
  });

  it(`can be converted to a string`, () => {
    expect(String(PDFHeader.forVersion(1, 7))).toBe('%PDF-1.7\n%');
  });

  it(`can provide its size in bytes`, () => {
    expect(PDFHeader.forVersion(81, 79).sizeInBytes()).toBe(16);
  });

  it(`can be serialized`, () => {
    const buffer = new Uint8Array(20).fill(toCharCode(' '));
    expect(PDFHeader.forVersion(79, 81).copyBytesInto(buffer, 3)).toBe(16);
    expect(buffer).toEqual(typedArrayFor('   %PDF-79.81\n% '));
  });
});
