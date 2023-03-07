import { PDFTrailer } from '../../../src/core';
import { toCharCode, typedArrayFor } from '../../../src/utils';

describe(`PDFTrailer`, () => {
  it(`can be constructed from PDFTrailer.forLastCrossRefSectionOffset(...)`, () => {
    expect(PDFTrailer.forLastCrossRefSectionOffset(21)).toBeInstanceOf(
      PDFTrailer,
    );
  });

  it(`can be converted to a string`, () => {
    expect(String(PDFTrailer.forLastCrossRefSectionOffset(799))).toBe(
      'startxref\n799\n%%EOF',
    );
  });

  it(`can provide its size in bytes`, () => {
    expect(PDFTrailer.forLastCrossRefSectionOffset(1919).sizeInBytes()).toBe(
      20,
    );
  });

  it(`can be serialized`, () => {
    const buffer = new Uint8Array(21).fill(toCharCode(' '));
    expect(PDFTrailer.forLastCrossRefSectionOffset(1).copyBytesInto(buffer, 3));
    expect(buffer).toEqual(typedArrayFor('   startxref\n1\n%%EOF '));
  });
});
